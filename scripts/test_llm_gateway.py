"""Smoke-test the configured OpenAI-compatible LLM gateway.

Usage:
    uv run python scripts/test_llm_gateway.py
    uv run python scripts/test_llm_gateway.py "Can you hear me?"
"""

import argparse
import os
import sys
from typing import Any

import httpx
from dotenv import load_dotenv


DEFAULT_PROMPT = "Can you hear me? Reply briefly."


def main() -> int:
    load_dotenv()

    parser = argparse.ArgumentParser(description="Send a simple prompt to the configured LLM gateway")
    parser.add_argument("prompt", nargs="?", default=DEFAULT_PROMPT)
    args = parser.parse_args()

    api_key = os.getenv("LLM_API_KEY", "").strip()
    model = os.getenv("LLM_MODEL", "").strip()
    endpoint = os.getenv("LLM_ENDPOINT", "").strip()
    missing = [name for name, value in {
        "LLM_API_KEY": api_key,
        "LLM_MODEL": model,
        "LLM_ENDPOINT": endpoint,
    }.items() if not value]
    if missing:
        print(f"Missing environment variable(s): {', '.join(missing)}", file=sys.stderr)
        return 2

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": args.prompt}],
    }
    print(f"Endpoint: {endpoint}")
    print(f"Model: {model}")
    print(f"Prompt: {args.prompt}")

    try:
        response = httpx.post(
            endpoint,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30.0,
        )
    except httpx.HTTPError as error:
        print(f"Connection failed: {error}", file=sys.stderr)
        return 1

    print(f"HTTP status: {response.status_code}")
    if response.is_error:
        print("Gateway response:")
        print(response.text)
        return 1

    try:
        response_data: dict[str, Any] = response.json()
        answer = response_data["choices"][0]["message"]["content"]
        print("Model response:")
        print(answer)
    except (ValueError, KeyError, IndexError, TypeError):
        print("Raw response:")
        print(response.text)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
