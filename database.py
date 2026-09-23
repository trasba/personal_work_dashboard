"""
Database module for AuraWork AI using standard library SQLite.
Manages tasks, AI memory rules, followups, and the immutable audit log.
Automatically initializes tables and default seed data on first run.
"""

import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "aurawork.db")


def get_connection() -> sqlite3.Connection:
    """Returns a connection with Row factory enabled."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


import shutil
from datetime import datetime


def create_backup() -> Optional[str]:
    """Creates a timestamped backup copy of aurawork.db in the data directory."""
    if not os.path.exists(DB_PATH):
        return None
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"aurawork_backup_{timestamp}.db"
    backup_path = os.path.join(DB_DIR, backup_filename)
    shutil.copy2(DB_PATH, backup_path)
    return backup_filename


def init_db(force_reset: bool = False, seed_dummy: bool = True):
    """Creates schema and seeds initial data if empty and requested."""
    conn = get_connection()
    cursor = conn.cursor()

    if force_reset:
        cursor.executescript("""
            DROP TABLE IF EXISTS tasks;
            DROP TABLE IF EXISTS ai_memory_rules;
            DROP TABLE IF EXISTS followups;
            DROP TABLE IF EXISTS audit_log;
        """)

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            duration INTEGER NOT NULL DEFAULT 30,
            priority TEXT NOT NULL DEFAULT 'medium',
            tier TEXT NOT NULL DEFAULT 'today',
            category TEXT NOT NULL DEFAULT 'General',
            completed BOOLEAN NOT NULL DEFAULT 0,
            scheduled_slot_id TEXT,
            source TEXT NOT NULL DEFAULT 'manual',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ai_memory_rules (
            id TEXT PRIMARY KEY,
            rule_type TEXT NOT NULL,
            pattern_value TEXT NOT NULL,
            label TEXT NOT NULL,
            times_applied INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS followups (
            id TEXT PRIMARY KEY,
            person TEXT NOT NULL,
            topic TEXT NOT NULL,
            channel TEXT NOT NULL DEFAULT 'Outlook Email',
            sent_date TEXT NOT NULL,
            expected_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'waiting',
            urgency_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS audit_log (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            action_type TEXT NOT NULL,
            summary TEXT NOT NULL,
            revertable BOOLEAN NOT NULL DEFAULT 1,
            status TEXT NOT NULL DEFAULT 'applied',
            parameters_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()

    # Check if empty, seed initial data only if seed_dummy is True
    if seed_dummy:
        cursor.execute("SELECT COUNT(*) FROM tasks")
        if cursor.fetchone()[0] == 0:
            _seed_initial_data(conn)

    conn.close()


def clear_all_data(create_backup_first: bool = True) -> Dict[str, Any]:
    """
    Cleans the database for a fresh productive start.
    Creates a backup copy first to prevent data loss.
    """
    backup_file = None
    if create_backup_first:
        backup_file = create_backup()

    conn = get_connection()
    cursor = conn.cursor()
    cursor.executescript("""
        DELETE FROM tasks;
        DELETE FROM followups;
        DELETE FROM audit_log;
        DELETE FROM ai_memory_rules;
    """)
    conn.commit()
    conn.close()
    return {
        "success": True,
        "backup_created": backup_file is not None,
        "backup_file": backup_file,
        "message": f"Database cleared for production. Backup saved as {backup_file}" if backup_file else "Database cleared."
    }



def _seed_initial_data(conn: sqlite3.Connection):
    cursor = conn.cursor()

    initial_tasks = [
        ("task-1", "Finalize Q3 Board Performance Deck", 60, "high", "today", "Strategic", 0, "slot-1330", "calendar"),
        ("task-2", "Review & approve Enterprise Vendor Agreement (legal)", 30, "high", "today", "Operations", 0, "slot-1030", "email"),
        ("task-3", "Draft 1-pager for AI Auto-Scheduling feature scope", 45, "medium", "today", "Product", 0, None, "manual"),
        ("task-4", "Catch up with Design lead on mobile time-blocking UI", 25, "low", "today", "Design", 0, None, "manual"),
        ("task-5", "Audit cloud infrastructure cost report for August", 45, "medium", "upcoming", "DevOps", 0, None, "manual"),
        ("task-6", "Conduct customer discovery synthesis (Cohort B)", 60, "high", "upcoming", "Research", 0, None, "manual"),
        ("task-7", "Prepare talking points for All-Hands Q&A session", 30, "medium", "upcoming", "Leadership", 0, None, "manual"),
        ("task-8", "Review Figma prototype for new User Onboarding flow", 40, "high", "upcoming", "Product", 0, None, "manual"),
        ("task-9", "Consolidate Q4 team hiring plan & headcounts", 90, "medium", "backlog", "Hiring", 0, None, "manual"),
        ("task-10", "Draft security compliance response for SOC2 type II audit", 120, "high", "backlog", "Security", 0, None, "manual"),
        ("task-11", "Write documentation on engineering design review guidelines", 60, "low", "backlog", "Process", 0, None, "manual"),
        ("task-12", "Benchmark competing AI calendar assistants (Notion Cal, Motion)", 45, "low", "backlog", "Research", 0, None, "manual"),
        ("task-13", "Explore migrating API documentation to interactive playground", 180, "low", "someday", "DevRel", 0, None, "manual"),
        ("task-14", "Redesign executive weekly digest email format", 60, "low", "someday", "Internal", 0, None, "manual")
    ]
    cursor.executemany("""
        INSERT INTO tasks (id, title, duration, priority, tier, category, completed, scheduled_slot_id, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, initial_tasks)

    initial_rules = [
        ("rule-1", "subject_prefix", "Accepted: *", "Subject: 'Accepted:*'", 24),
        ("rule-2", "sender_domain", "@notifications.jira.com", "Sender: '@notifications.jira.com'", 18)
    ]
    cursor.executemany("""
        INSERT INTO ai_memory_rules (id, rule_type, pattern_value, label, times_applied)
        VALUES (?, ?, ?, ?, ?)
    """, initial_rules)

    initial_followups = [
        ("follow-1", "Sarah Jenkins (Legal Counsel)", "Enterprise DPA and Indemnity clause sign-off", "Outlook Email", "Sep 20 (3d ago)", "Sep 22", "overdue", "Overdue by 1 day"),
        ("follow-2", "David Kim (Lead Architect)", "Database migration latency benchmark numbers", "Slack #architecture", "Sep 22 (Yesterday)", "Sep 24", "waiting", "Expected tomorrow"),
        ("follow-3", "Rachel Green (Procurement)", "Hardware budget PO approval for engineering laptops", "Gmail", "Sep 23 (Today)", "Sep 25", "waiting", "Expected Friday"),
        ("follow-4", "Tom Hayes (Security Officer)", "Vendor security assessment questionnaire", "Outlook Email", "Sep 18", "Sep 21", "resolved", "Approved yesterday")
    ]
    cursor.executemany("""
        INSERT INTO followups (id, person, topic, channel, sent_date, expected_date, status, urgency_text)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, initial_followups)

    initial_audit = [
        ("log-1", "Today, 14:15", "TIME_BLOCK_OPTIMIZE", "Auto-scheduled 'Finalize Q3 Board Deck' into 1:30 PM slot", 1, "applied", json.dumps({
            "type": "SCHEDULE_SLOT",
            "slotId": "slot-1330",
            "taskId": "task-1"
        })),
        ("log-2", "Today, 11:30", "TRIAGE_PROMOTE", "Promoted 'Enterprise Vendor Agreement' from Tier 2 to Tier 1", 1, "applied", json.dumps({
            "type": "TASK_TIER_MOVE",
            "taskId": "task-2",
            "fromTier": "upcoming",
            "toTier": "today"
        }))
    ]
    cursor.executemany("""
        INSERT INTO audit_log (id, timestamp, action_type, summary, revertable, status, parameters_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, initial_audit)

    conn.commit()


# --- Task Operations ---
def get_all_tasks() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def create_task(task_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    conn.execute("""
        INSERT INTO tasks (id, title, duration, priority, tier, category, completed, scheduled_slot_id, source)
        VALUES (:id, :title, :duration, :priority, :tier, :category, :completed, :scheduled_slot_id, :source)
    """, task_data)
    conn.commit()
    conn.close()
    return task_data


def update_task(task_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    set_clauses = [f"{k} = :{k}" for k in updates.keys()]
    updates["id"] = task_id
    query = f"UPDATE tasks SET {', '.join(set_clauses)} WHERE id = :id"
    conn.execute(query, updates)
    conn.commit()
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def delete_task(task_id: str) -> bool:
    conn = get_connection()
    cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted


# --- AI Memory Rules Operations ---
def get_all_rules() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM ai_memory_rules ORDER BY created_at ASC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def add_rule(rule_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    conn.execute("""
        INSERT INTO ai_memory_rules (id, rule_type, pattern_value, label, times_applied)
        VALUES (:id, :rule_type, :pattern_value, :label, :times_applied)
    """, rule_data)
    conn.commit()
    conn.close()
    return rule_data


def delete_rule(rule_id: str) -> bool:
    conn = get_connection()
    cursor = conn.execute("DELETE FROM ai_memory_rules WHERE id = ?", (rule_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted


# --- Follow-up Operations ---
def get_all_followups() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM followups ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def create_followup(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    conn.execute("""
        INSERT INTO followups (id, person, topic, channel, sent_date, expected_date, status, urgency_text)
        VALUES (:id, :person, :topic, :channel, :sent_date, :expected_date, :status, :urgency_text)
    """, data)
    conn.commit()
    conn.close()
    return data


def update_followup(followup_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    set_clauses = [f"{k} = :{k}" for k in updates.keys()]
    updates["id"] = followup_id
    query = f"UPDATE followups SET {', '.join(set_clauses)} WHERE id = :id"
    conn.execute(query, updates)
    conn.commit()
    row = conn.execute("SELECT * FROM followups WHERE id = ?", (followup_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


# --- Audit Log Operations ---
def get_all_audit_logs() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM audit_log ORDER BY created_at DESC").fetchall()
    conn.close()
    results = []
    for r in rows:
        d = dict(r)
        d["parameters"] = json.loads(d["parameters_json"])
        results.append(d)
    return results


def log_action(log_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    params_str = json.dumps(log_data.get("parameters", {}))
    conn.execute("""
        INSERT INTO audit_log (id, timestamp, action_type, summary, revertable, status, parameters_json)
        VALUES (:id, :timestamp, :action_type, :summary, :revertable, :status, :parameters_json)
    """, {
        "id": log_data["id"],
        "timestamp": log_data["timestamp"],
        "action_type": log_data["action_type"],
        "summary": log_data["summary"],
        "revertable": log_data.get("revertable", True),
        "status": log_data.get("status", "applied"),
        "parameters_json": params_str
    })
    conn.commit()
    conn.close()
    return log_data


def update_audit_status(log_id: str, new_status: str) -> bool:
    conn = get_connection()
    cursor = conn.execute("UPDATE audit_log SET status = ? WHERE id = ?", (new_status, log_id))
    conn.commit()
    updated = cursor.rowcount > 0
    conn.close()
    return updated
