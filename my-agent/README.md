# my-agent

Generated with `uvx vision-agents init`. See the docs at <https://visionagents.ai>.

## Setup

1. Install Python 3.12 through uv if it is not already available:

   ```bash
   uv python install 3.12
   ```

2. Add the Google and Stream credentials to the repository-level `.env.local` file.
3. Install dependencies:

   ```bash
   uv sync
   ```

4. Run the agent:

   ```bash
   uv run agent.py run     # single-call console
   uv run agent.py serve   # HTTP server
   ```

5. Run the tests:

   ```bash
   uv run pytest
   ```

## Docker

```bash
docker build -t my-agent .
docker run --env-file .env -p 8000:8000 my-agent
```

## References

- [Vision Agents documentation](https://visionagents.ai)
- [Vision Agents MCP server](https://visionagents.ai/mcp)
- [Vision Agents skill](https://visionagents.ai/skill.md)
