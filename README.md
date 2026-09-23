# AuraWork AI — Personal Work & Focus Dashboard with Windows Outlook MAPI Bridge

An AI-powered personal daily work and focus dashboard designed to structure daily tasks, manage calendar time-blocks, and integrate directly with Windows Outlook via native MAPI / COM automation.

---

## Architecture: Single-Process Python Server

The application runs as a **single, unified Python service** using `uv` and **FastAPI**:
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

## Outlook MAPI Endpoints Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System status, platform detection, and `pywin32` COM availability. |
| `GET` | `/api/outlook/inbox` | Fetches recent messages from Outlook Inbox (`limit`, `unread_only`). Returns subject, sender, date, snippet, and MAPI `entry_id`. |
| `GET` | `/api/outlook/calendar` | Reads scheduled meetings and calendar events for planning ahead. Query parameters:<br>• `start_date`: e.g. `2026-09-24` (defaults to today)<br>• `end_date`: optional end date string (`YYYY-MM-DD`)<br>• `days`: number of workdays to retrieve (e.g. `1` for today, `5` for the entire week ahead). Returns start/end times, durations, locations, and attendee status. |
| `POST` | `/api/outlook/archive` | Moves a list of `entry_ids` from `Inbox` to the `Archive` folder. |
| `POST` | `/api/outlook/restore` | Moves a list of `entry_ids` back from `Archive` to `Inbox` (1-click Undo / Revert). |


---

## Testing

Run the automated backend test suite (validates endpoints, payload schemas, and OpenAPI documentation):
```bash
uv run pytest
```
