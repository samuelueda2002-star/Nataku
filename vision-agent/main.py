import os
import tempfile
from typing import Any, Optional

from dotenv import load_dotenv

# Load shared app and Stream keys from the repository-level environment file.
load_dotenv(
    os.path.join(os.path.dirname(__file__), "..", ".env.local"),
    override=True,
)
# Local .env adds OPENAI_API_KEY and can override any key
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

from getstream.models import MemberRequest  # noqa: E402
from openai.types.realtime.realtime_transcription_session_audio_input_turn_detection_param import ServerVad  # noqa: E402
from vision_agents.core import Agent, AgentLauncher, User, Runner  # noqa: E402
from vision_agents.core.instructions import Instructions  # noqa: E402
from vision_agents.core.utils.audio_filter import FirstSpeakerWinsFilter  # noqa: E402
from vision_agents.plugins import getstream, openai  # noqa: E402

AGENT_USER_ID = "ai-teacher"
VAD_MODEL_DIR = os.path.join(tempfile.gettempdir(), "lingua-vision-agent-vad")

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
    lesson_title = custom.get("lesson_title")
    lesson_description = custom.get("lesson_description")
    goals = _string_list(custom.get("goals"))
    vocabulary = _format_vocabulary(custom.get("vocabulary"))
    phrases = _format_phrases(custom.get("phrases"))
    topics = _string_list(custom.get("topics"))

    sections = [f"Target language: {language_name}"]
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
    return Agent(
        edge=getstream.Edge(),
        llm=openai.Realtime(
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
        ),
        agent_user=User(name="AI Teacher", id=AGENT_USER_ID),
        instructions=DEFAULT_SYSTEM_PROMPT,
        multi_speaker_filter=FirstSpeakerWinsFilter(model_dir=VAD_MODEL_DIR),
    )


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
        input_text=f"{system_prompt}\n\n{lesson_context}"
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

    async with agent.join(call):
        # Wait for the student to join (returns immediately if already present)
        await agent.wait_for_participant(timeout=60.0)

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
