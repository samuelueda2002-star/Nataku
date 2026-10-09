# Lingua Vision Agent

Voice-only AI language teacher built with Vision Agents, OpenAI Realtime, and
Stream Edge.

## Environment

The service loads `STREAM_API_KEY` and `STREAM_API_SECRET` from the repository
root `.env` or `.env.local`. Create `vision-agent/.env` with the remaining key:

```dotenv
OPENAI_API_KEY=your_openai_api_key
```

The Expo API route connects to `http://127.0.0.1:8000` by default. Set the
server-only `VISION_AGENT_URL` in the repository root environment when the
agent is hosted elsewhere:

```dotenv
VISION_AGENT_URL=https://your-agent-service.example.com
```

## Run

From the repository root:

```bash
uv sync --project vision-agent
uv run --project vision-agent python vision-agent/main.py serve
```

For a single development call:

```bash
uv run --project vision-agent python vision-agent/main.py run --call-id your-call-id
```
