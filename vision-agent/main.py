import asyncio
import logging
import os
import tempfile
from collections.abc import Awaitable, Callable
from typing import Any, Literal, Optional

from dotenv import load_dotenv

SERVICE_DIR = os.path.dirname(__file__)
REPOSITORY_DIR = os.path.dirname(SERVICE_DIR)

# Reuse the app's Stream credentials. The Expo project currently uses
# .env.local, while .env is also supported for conventional deployments.
load_dotenv(os.path.join(REPOSITORY_DIR, ".env"), override=True)
load_dotenv(os.path.join(REPOSITORY_DIR, ".env.local"), override=True)
# The service-local file is the intended home for OPENAI_API_KEY and may
# override shared values during local development.
load_dotenv(os.path.join(SERVICE_DIR, ".env"), override=True)

from getstream.models import MemberRequest  # noqa: E402
from openai.types.realtime.realtime_transcription_session_audio_input_turn_detection_param import ServerVad  # noqa: E402
from vision_agents.core import Agent, AgentLauncher, User, Runner  # noqa: E402
from vision_agents.core.instructions import Instructions  # noqa: E402
from vision_agents.core.utils.audio_filter import FirstSpeakerWinsFilter  # noqa: E402
from vision_agents.plugins import getstream, openai  # noqa: E402

AGENT_USER_ID = "ai-teacher"
VAD_MODEL_DIR = os.path.join(tempfile.gettempdir(), "lingua-vision-agent-vad")
CAPTION_UPDATE_INTERVAL_SECONDS = 0.15
logger = logging.getLogger(__name__)

CaptionSpeaker = Literal["agent", "user"]
CaptionPublisher = Callable[[dict[str, Any]], Awaitable[None]]


class LiveCaptionRealtime(openai.Realtime):
    """Forwards OpenAI's interim transcripts to participants in the Stream call."""

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self._caption_publisher: CaptionPublisher | None = None
        self._caption_text: dict[tuple[CaptionSpeaker, str], str] = {}
        self._caption_sequence: dict[tuple[CaptionSpeaker, str], int] = {}
        self._caption_flush_tasks: dict[
            tuple[CaptionSpeaker, str], asyncio.Task[None]
        ] = {}
        self._caption_tasks: set[asyncio.Task[None]] = set()
        self._captions_closing = False

    def set_caption_publisher(self, publisher: CaptionPublisher) -> None:
        self._caption_publisher = publisher

    def _publish_caption(
        self,
        event: dict[str, Any],
        speaker: CaptionSpeaker,
        *,
        final: bool,
    ) -> None:
        publisher = self._caption_publisher
        text_part = event.get("transcript" if final else "delta")
        if (
            self._captions_closing
            or publisher is None
            or not isinstance(text_part, str)
            or not text_part
        ):
            return

        utterance_id = event.get("item_id") or event.get("response_id")
        if not isinstance(utterance_id, str) or not utterance_id:
            utterance_id = event.get("event_id")
        if not isinstance(utterance_id, str) or not utterance_id:
            return

        key = (speaker, utterance_id)
        text = text_part if final else self._caption_text.get(key, "") + text_part
        # Stream custom events have a 5 KB payload limit. Lesson turns are short,
        # but keep a defensive ceiling so captions can never break the audio flow.
        text = text[:4000]
        self._caption_text[key] = text

        if not final:
            if key not in self._caption_flush_tasks:
                self._caption_flush_tasks[key] = asyncio.create_task(
                    self._flush_partial_caption(publisher, key)
                )
            return

        pending_flush = self._caption_flush_tasks.pop(key, None)
        if pending_flush is not None:
            pending_flush.cancel()
        self._schedule_caption_event(publisher, key, text, final=True)
        self._caption_text.pop(key, None)

    async def _flush_partial_caption(
        self,
        publisher: CaptionPublisher,
        key: tuple[CaptionSpeaker, str],
    ) -> None:
        sent_text: str | None = None
        try:
            # OpenAI can emit a delta per token. Coalesce a few tokens so the
            # call receives smooth updates without flooding custom events.
            await asyncio.sleep(CAPTION_UPDATE_INTERVAL_SECONDS)
            sent_text = self._caption_text.get(key)
            if sent_text:
                self._schedule_caption_event(
                    publisher, key, sent_text, final=False
                )
        finally:
            current_task = asyncio.current_task()
            if self._caption_flush_tasks.get(key) is current_task:
                self._caption_flush_tasks.pop(key, None)
            latest_text = self._caption_text.get(key)
            if (
                not self._captions_closing
                and latest_text
                and latest_text != sent_text
            ):
                self._caption_flush_tasks[key] = asyncio.create_task(
                    self._flush_partial_caption(publisher, key)
                )

    def _schedule_caption_event(
        self,
        publisher: CaptionPublisher,
        key: tuple[CaptionSpeaker, str],
        text: str,
        *,
        final: bool,
    ) -> None:
        speaker, utterance_id = key
        sequence = self._caption_sequence.get(key, 0) + 1
        self._caption_sequence[key] = sequence

        task = asyncio.create_task(
            self._send_caption_event(
                publisher,
                {
                    "type": "transcript_final" if final else "transcript_partial",
                    "speaker": speaker,
                    "text": text,
                    "utterance_id": utterance_id,
                    "sequence": sequence,
                },
            )
        )
        self._caption_tasks.add(task)
        task.add_done_callback(self._caption_tasks.discard)

    async def _send_caption_event(
        self,
        publisher: CaptionPublisher,
        payload: dict[str, Any],
    ) -> None:
        try:
            await publisher(payload)
        except Exception as error:
            # Captions are additive; a delivery failure must not interrupt audio.
            logger.warning("Could not publish live caption: %s", error)

    async def _handle_openai_event(self, event: dict[str, Any]) -> None:
        event_type = event.get("type")

        if event_type in {
            "response.audio_transcript.delta",
            "response.output_audio_transcript.delta",
        }:
            self._publish_caption(event, "agent", final=False)
        elif event_type in {
            "response.audio_transcript.done",
            "response.output_audio_transcript.done",
        }:
            self._publish_caption(event, "agent", final=True)
        elif event_type == "conversation.item.input_audio_transcription.delta":
            self._publish_caption(event, "user", final=False)
        elif event_type == "conversation.item.input_audio_transcription.completed":
            self._publish_caption(event, "user", final=True)

        await super()._handle_openai_event(event)

    async def close(self) -> None:
        await super().close()
        self._captions_closing = True
        flush_tasks = tuple(self._caption_flush_tasks.values())
        self._caption_flush_tasks.clear()
        for task in flush_tasks:
            task.cancel()
        if flush_tasks:
            await asyncio.gather(*flush_tasks, return_exceptions=True)
        if self._caption_tasks:
            await asyncio.gather(*tuple(self._caption_tasks), return_exceptions=True)


LANGUAGE_NAMES: dict[str, str] = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "ja": "Japanese",
    "de": "German",
}

DEFAULT_SYSTEM_PROMPT = (
    "You are a warm, energetic AI language teacher having a real voice conversation with a student. "
    "You operate in exactly two modes and NEVER mix them:\n"
    "TEACHING MODE: Say one word or phrase, its English meaning, and one pronunciation tip. "
    "End with a single question like 'Can you say that?' or 'Give it a try!'. "
    "Your turn is OVER at that question mark. Stop speaking. Output nothing else. "
    "Do NOT imagine what the student will say. Do NOT pre-write your reaction. Just stop.\n"
    "REACTING MODE: You have just received actual speech from the student in this turn. "
    "React to what they actually said — one sentence of praise or correction — "
    "then either ask them to try again or introduce the next word. Stop.\n"
    "ABSOLUTE RULES:\n"
    "- Never say 'Nice job', 'Perfect', 'Great', or any praise unless the student has "
    "ACTUALLY spoken in the current turn and you heard something from them.\n"
    "- Never continue past a question mark. Every question is a hard stop.\n"
    "- Never role-play the student's response or write what you imagine they said.\n"
    "- Keep every reply to one or two short sentences maximum.\n"
    "- Stay strictly within the current lesson's vocabulary."
)

ENGLISH_TEACHING_POLICY = (
    "Always conduct the lesson in English. Use the selected target language only "
    "when demonstrating words or phrases the student is learning. Explain meanings, "
    "pronunciation, corrections, and feedback in English."
)

def _require_env(var_name: str) -> None:
    if not os.getenv(var_name):
        raise RuntimeError(f"Missing required environment variable: {var_name}")

def _language_name_from_call_id(call_id: str) -> Optional[str]:
    # call_id format: lesson-{langCode}-lesson-{n}-{userId}
    parts = call_id.split("-")
    if len(parts) >= 2 and parts[0] == "lesson":
        return LANGUAGE_NAMES.get(parts[1])
    return None


def _string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [item.strip() for item in value if isinstance(item, str) and item.strip()]


def _format_goals(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    entries: list[str] = []
    for item in value:
        if isinstance(item, str) and item.strip():
            entries.append(item.strip())
        elif isinstance(item, dict):
            desc = item.get("description")
            if isinstance(desc, str) and desc.strip():
                entries.append(desc.strip())
    return entries


def _format_vocabulary(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []

    entries: list[str] = []
    for item in value:
        if isinstance(item, str) and item.strip():
            entries.append(item.strip())
            continue
        if not isinstance(item, dict):
            continue

        word = item.get("word")
        if not isinstance(word, str) or not word.strip():
            continue
        details = [
            item.get("translation") if isinstance(item.get("translation"), str) else None,
            (
                f"pronunciation: {item['pronunciation']}"
                if isinstance(item.get("pronunciation"), str)
                else None
            ),
        ]
        suffix = "; ".join(detail for detail in details if detail)
        entries.append(f"{word.strip()}: {suffix}" if suffix else word.strip())
    return entries


def _format_phrases(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []

    entries: list[str] = []
    for item in value:
        if isinstance(item, str) and item.strip():
            entries.append(item.strip())
            continue
        if not isinstance(item, dict):
            continue

        text = item.get("text")
        if not isinstance(text, str) or not text.strip():
            continue
        details = [
            item.get("translation") if isinstance(item.get("translation"), str) else None,
            (
                f"pronunciation: {item['pronunciation']}"
                if isinstance(item.get("pronunciation"), str)
                else None
            ),
        ]
        suffix = "; ".join(detail for detail in details if detail)
        entries.append(f"{text.strip()} ({suffix})" if suffix else text.strip())
    return entries


def _lesson_instructions(custom: dict[str, Any], language_name: str) -> str:
    lesson_id = custom.get("lesson_id")
    lesson_title = custom.get("lesson_title")
    lesson_description = custom.get("lesson_description")
    goals = _format_goals(custom.get("goals"))
    vocabulary = _format_vocabulary(custom.get("vocabulary"))
    phrases = _format_phrases(custom.get("phrases"))
    topics = _string_list(custom.get("topics"))

    sections = [f"Target language: {language_name}"]
    if isinstance(lesson_id, str) and lesson_id.strip():
        sections.append(f"Selected lesson ID: {lesson_id.strip()}")
    if isinstance(lesson_title, str) and lesson_title.strip():
        sections.append(f"Selected lesson: {lesson_title.strip()}")
    if isinstance(lesson_description, str) and lesson_description.strip():
        sections.append(f"Lesson description: {lesson_description.strip()}")
    if goals:
        sections.append("Lesson goals:\n- " + "\n- ".join(goals))
    if vocabulary:
        sections.append("Allowed vocabulary:\n- " + "\n- ".join(vocabulary))
    if phrases:
        sections.append("Practice phrases:\n- " + "\n- ".join(phrases))
    if topics:
        sections.append("Lesson topics:\n- " + "\n- ".join(topics))

    sections.append(
        "Use this lesson context throughout the call. Teach toward the goals and "
        "stay within the listed vocabulary, phrases, and topics."
    )
    return "\n\n".join(sections)


async def create_agent(**kwargs) -> Agent:
    realtime_llm = LiveCaptionRealtime(
        send_video=False,
        # server_vad fires on raw audio energy (~100 ms after mic opens) rather
        # than waiting for semantic speech intent detection (~500 ms+).
        # This means the agent stops speaking almost immediately when the user
        # presses the push-and-hold mic button, before they have said a word.
        realtime_session={
            "type": "realtime",
            "audio": {
                "input": {
                    "transcription": {"model": "gpt-4o-mini-transcribe"},
                    "turn_detection": ServerVad(
                        type="server_vad",
                        threshold=0.4,         # low enough to catch ambient noise on mic open
                        prefix_padding_ms=200,  # capture brief audio before speech onset
                        silence_duration_ms=400, # commit turn after 400 ms of silence
                        interrupt_response=True, # stop agent audio the moment VAD fires
                    ),
                }
            },
        }
    )
    agent = Agent(
        edge=getstream.Edge(),
        llm=realtime_llm,
        agent_user=User(name="AI Teacher", id=AGENT_USER_ID),
        instructions=f"{DEFAULT_SYSTEM_PROMPT}\n\n{ENGLISH_TEACHING_POLICY}",
        multi_speaker_filter=FirstSpeakerWinsFilter(model_dir=VAD_MODEL_DIR),
    )
    realtime_llm.set_caption_publisher(agent.send_custom_event)
    return agent


async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs) -> None:
    call = await agent.create_call(call_type, call_id)

    # Read lesson context packed into the call's custom data by the mobile app
    custom: dict[str, Any] = {}
    try:
        resp = await call.get()
        custom = resp.data.call.custom or {}
    except Exception as e:
        print(f"[agent] Warning: could not fetch call custom data: {e}")

    system_prompt = custom.get("system_prompt") or DEFAULT_SYSTEM_PROMPT
    intro_message = custom.get("intro_message")
    language_code = custom.get("language") or ""
    lesson_title = custom.get("lesson_title") or ""
    learner_name = custom.get("user_name") or "A student"
    language_name = (
        custom.get("language_name")
        or LANGUAGE_NAMES.get(language_code)
        or _language_name_from_call_id(call_id)
        or "language"
    )

    # Apply every lesson field before joining so the Realtime LLM receives the
    # selected language, goals, vocabulary, phrases, topics, and teacher prompt.
    lesson_context = _lesson_instructions(custom, language_name)
    agent.instructions = Instructions(
        input_text=(
            f"{system_prompt}\n\n{ENGLISH_TEACHING_POLICY}\n\n{lesson_context}"
        )
    )

    # audio_room starts backstage. The agent must be an admin and the room must
    # be live before regular audio can flow, so treat both operations as required.
    try:
        await call.update_call_members(
            update_members=[MemberRequest(user_id=AGENT_USER_ID, role="admin")]
        )
    except Exception as e:
        print(f"[agent] Could not grant the admin role: {e}")
        raise

    try:
        await call.go_live()
    except Exception as e:
        print(f"[agent] Could not take the audio room live: {e}")
        raise

    async with agent.join(call, participant_wait_timeout=60.0):
        if intro_message:
            context_parts = [f"{learner_name} just joined your {language_name} lesson"]
            if lesson_title:
                context_parts[0] += f" — '{lesson_title}'"
            context_parts[0] += "."
            context_parts.append(
                f"Deliver this greeting and NOTHING else: \"{intro_message}\" "
                f"After the greeting, ask the student one simple question to get them talking — "
                f"for example 'Are you ready to get started?' or 'Have you learned any {language_name} before?' "
                f"Then STOP and wait for the student's reply before teaching anything."
            )
            await agent.simple_response(" ".join(context_parts))
        else:
            await agent.simple_response(
                f"{learner_name} just joined your {language_name} lesson. "
                f"Greet them warmly and ask one short question — like 'Ready to learn some {language_name}?' "
                f"Then STOP and wait for their reply before you teach anything."
            )

        await agent.finish()


if __name__ == "__main__":
    _require_env("STREAM_API_KEY")
    _require_env("STREAM_API_SECRET")
    _require_env("OPENAI_API_KEY")

    Runner(AgentLauncher(create_agent=create_agent, join_call=join_call)).cli()
