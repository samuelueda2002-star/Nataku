from pathlib import Path
import tempfile
from typing import Any

from dotenv import load_dotenv
from getstream.models import MemberRequest
from vision_agents.core import Agent, Runner, User
from vision_agents.core.agents import AgentLauncher
from vision_agents.core.instructions import Instructions
from vision_agents.core.utils.audio_filter import FirstSpeakerWinsFilter
from vision_agents.plugins import getstream, gemini

load_dotenv(Path(__file__).resolve().parents[1] / ".env.local", override=True)
load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=True)


INSTRUCTIONS = (
    "You are a warm language teacher leading a short voice lesson. "
    "Teach one phrase at a time, keep responses to one or two sentences, "
    "ask the learner to respond, and wait for their answer."
)

AGENT_USER_ID = "ai-teacher"
VAD_MODEL_DIR = Path(tempfile.gettempdir()) / "lingua-vision-agent-vad"

LANGUAGE_NAMES: dict[str, str] = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "ja": "Japanese",
    "de": "German",
}


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
    return Agent(
        edge=getstream.Edge(),
        agent_user=User(name="AI Teacher", id=AGENT_USER_ID),
        instructions=INSTRUCTIONS,
        llm=gemini.Realtime(),
        multi_speaker_filter=FirstSpeakerWinsFilter(
            model_dir=str(VAD_MODEL_DIR),
        ),
    )


async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs) -> None:
    call = await agent.create_call(call_type, call_id)

    custom = {}
    try:
        response = await call.get()
        custom = response.data.call.custom or {}
    except Exception as error:
        print(f"[agent] Could not load lesson context: {error}")

    system_prompt = custom.get("system_prompt") or INSTRUCTIONS
    intro_message = custom.get("intro_message")
    language_code = custom.get("language") or ""
    language_name = (
        custom.get("language_name")
        or LANGUAGE_NAMES.get(language_code)
        or "the selected language"
    )
    lesson_title = custom.get("lesson_title") or "audio lesson"
    learner_name = custom.get("user_name") or "the learner"

    lesson_context = _lesson_instructions(custom, language_name)
    agent.instructions = Instructions(
        input_text=f"{system_prompt}\n\n{lesson_context}"
    )

    # audio_room starts backstage. The agent must be an admin and the room must
    # be live before regular audio can flow.
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
            await agent.simple_response(
                text=(
                    f"Welcome {learner_name} to the {lesson_title} lesson in "
                    f"{language_name}. Say this greeting: {intro_message!r} "
                    "Then ask one short question and wait for the learner to answer."
                )
            )
        else:
            await agent.simple_response(
                text=(
                    f"Welcome {learner_name} to the {lesson_title} lesson in "
                    f"{language_name}. Introduce the first phrase, ask one short "
                    "question, and wait for the learner to answer."
                )
            )
        await agent.finish()


runner = Runner(AgentLauncher(create_agent=create_agent, join_call=join_call))


if __name__ == "__main__":
    runner.cli()
