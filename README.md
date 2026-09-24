# AuraWork AI — Personal Work & Focus Dashboard with Windows Outlook MAPI Bridge

An AI-powered personal daily work and focus dashboard designed to structure daily tasks, manage calendar time-blocks, and integrate directly with Windows Outlook via native MAPI / COM automation.

---

## Architecture: Single-Process Python Server with SQLite

The application runs as a **single, unified Python service** using `uv` and **FastAPI**:
- **Local SQLite Storage (`data/aurawork.db`)**: Persistent relational storage for tasks, AI clean-up memory rules, followups, and the immutable audit log. Auto-initializes on startup.
- **Frontend SPA**: Serves the single-page dashboard at `http://127.0.0.1:8000/` (`index.html`, `styles.css`, `app.js`).
- **Outlook MAPI Bridge**: Exposes REST endpoints on `/api/outlook/*` directly backed by `win32com.client` COM automation.
- **Interactive OpenAPI Documentation**: Available at `http://127.0.0.1:8000/docs` (Swagger UI) and `/redoc`.

---

## Quick Start

### 1. Requirements
- Windows 10/11 with desktop Outlook installed.
- Python `>= 3.10` and [`uv`](https://github.com/astral-sh/uv).

### 2. Install & Sync Virtual Environment
```bash
uv sync
```

### 3. Launch the Server
```bash
uv run python server.py
```
Open **`http://127.0.0.1:8000/`** in your browser.

---

## API Endpoints Specification

### 1. Outlook MAPI Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System status, platform detection, SQLite status, and `pywin32` COM availability. |
| `GET` | `/api/outlook/inbox` | Fetches recent messages from Outlook Inbox (`limit`, `unread_only`). Returns subject, sender, date, snippet, and MAPI `entry_id`. |
| `GET` | `/api/outlook/calendar` | Reads scheduled meetings and calendar events for planning ahead. Query parameters:<br>• `start_date`: e.g. `2026-09-24` (defaults to today)<br>• `end_date`: optional end date string (`YYYY-MM-DD`)<br>• `days`: number of workdays to retrieve (e.g. `1` for today, `5` for the entire week ahead). Returns start/end times, durations, locations, and attendee status. |
| `POST` | `/api/outlook/archive` | Moves a list of `entry_ids` from `Inbox` to the `Archive` folder. |
| `POST` | `/api/outlook/restore` | Moves a list of `entry_ids` back from `Archive` to `Inbox` (1-click Undo / Revert). |

### 2. SQLite Data Storage Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET/POST` | `/api/tasks` | List all tasks or create a new task across any triage tier. |
| `PATCH/DELETE`| `/api/tasks/{task_id}` | Update task properties (e.g. tier promotion, completion) or delete a task. |
| `GET/POST` | `/api/rules` | List or register learned AI clean-up memory patterns (senders/subjects). |
| `DELETE` | `/api/rules/{rule_id}` | Remove a learned clean-up memory rule. |
| `GET/POST` | `/api/followups` | List or add delegated/waiting-for items with expected response dates. |
| `PATCH` | `/api/followups/{id}/resolve` | Mark a follow-up request as resolved. |
| `GET/POST` | `/api/audit` | List or append to the immutable AI action audit log. |
| `PATCH` | `/api/audit/{id}/revert` | Revert an AI action in SQLite and flip status to `reverted`. |

### 4. LLM Email Summaries

The email summarization endpoint uses an OpenAI-compatible chat-completions gateway when all
three variables below are configured. Create a `.env` file in the project root and fill in the
API key:

```env
LLM_API_KEY="paste-your-api-key-here"
LLM_MODEL="Gemini/google/gemini-3.8-flash"
LLM_ENDPOINT="https://llm.sdc.siemens.cloud/v1/chat/completions"
```

`POST /api/emails/summarize` sends the email subject, sender, and body to the configured model
and asks for JSON containing a summary, action items, suggested task, duration, and urgency.
The `.env` file is ignored by Git. If the variables are missing or the gateway returns an error,
the endpoint uses its deterministic local fallback so the dashboard remains usable.

Set `AI_DEBUG="true"` to print the exact LLM prompts and raw gateway responses in the server
console while diagnosing a request. Set it back to `false` afterward because email contents may
contain sensitive information. The API key is never printed.

Test the gateway independently with a simple prompt:

```bash
uv run python scripts/test_llm_gateway.py "Can you hear me?"
```

The script prints the HTTP status and either the model response or the gateway's raw error body.



---

## Testing

### 1. Automated Backend Unit & Integration Tests (pytest)
Validates endpoints, SQLite schemas, and OpenAPI documentation:
```bash
uv run pytest
```

### 2. End-to-End Browser Tests (Playwright)
Executes the comprehensive E2E test verifying SQLite connectivity, calendar lookahead, AI clean-up memory rules, bulk archive, and 1-click Revert:
```bash
npx playwright test
```
*(Ensure the FastAPI server is running with `uv run python server.py` before executing the E2E suite).*
