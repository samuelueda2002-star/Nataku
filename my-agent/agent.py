from dotenv import load_dotenv
from vision_agents.core import Agent, Runner, User
from vision_agents.core.agents import AgentLauncher
from vision_agents.core.instructions import Instructions
from vision_agents.plugins import getstream, gemini

load_dotenv()


INSTRUCTIONS = (
    "You are a warm language teacher leading a short voice lesson. "
    "Teach one phrase at a time, keep responses to one or two sentences, "
    "ask the learner to respond, and wait for their answer."
)

AGENT_USER_ID = "ai-teacher"


async def create_agent(**kwargs) -> Agent:
    return Agent(
        edge=getstream.Edge(),
        agent_user=User(name="AI Teacher", id=AGENT_USER_ID),
        instructions=INSTRUCTIONS,
        llm=gemini.Realtime(),
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
    language_name = custom.get("language_name") or "the selected language"
    lesson_title = custom.get("lesson_title") or "audio lesson"
    learner_name = custom.get("user_name") or "the learner"
    agent.instructions = Instructions(input_text=system_prompt)

    async with agent.join(call):
        await agent.wait_for_participant(timeout=60.0)
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
