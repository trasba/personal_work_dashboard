/**
 * AuraWork AI — Natural Language Task Parser (NLP)
 */

export function parseNaturalLanguageTask(text) {
  let title = text;
  let duration = 30;
  let priority = "medium";
  let tier = "today";

  const hourMatch = text.match(/(\d+)\s*(?:h|hr|hours?)\b/i);
  const minMatch = text.match(/(\d+)\s*(?:m|min|minutes?)\b/i);

  if (hourMatch) {
    duration = parseInt(hourMatch[1]) * 60;
    title = title.replace(hourMatch[0], "");
  } else if (minMatch) {
    duration = parseInt(minMatch[1]);
    title = title.replace(minMatch[0], "");
  }

  if (/\b(urgent|asap|high|critical)\b/i.test(text)) {
    priority = "high";
    title = title.replace(/\b(urgent|asap|high|critical)\b/gi, "");
  } else if (/\b(low|trivial|later)\b/i.test(text)) {
    priority = "low";
    title = title.replace(/\b(low|trivial|later)\b/gi, "");
  }

  if (/\b(tomorrow|next week|someday|backlog)\b/i.test(text)) {
    tier = "upcoming";
    title = title.replace(/\b(tomorrow|next week|someday|backlog)\b/gi, "");
  }

  title = title.replace(/\b(for|priority|due|in)\b/gi, "").replace(/\s+/g, " ").trim();
  if (!title) title = "New Task";

  return { title, duration, priority, tier };
}
