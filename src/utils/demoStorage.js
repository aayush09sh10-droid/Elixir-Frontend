// Defensive localStorage helpers for this client-only demo. Stored data is untrusted.
export function readDemo(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return structuredClone(fallback);
    const value = JSON.parse(raw);
    return value == null ? structuredClone(fallback) : value;
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      /* storage can be disabled */
    }
    return structuredClone(fallback);
  }
}

export function writeDemo(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function readList(key, seed = []) {
  const saved = readDemo(key, []);
  if (!Array.isArray(saved)) return structuredClone(seed);
  const byId = new Map(structuredClone(seed).map((item) => [item.id, item]));
  for (const item of saved)
    if (item && typeof item.id === 'string')
      byId.set(item.id, { ...(byId.get(item.id) || {}), ...item });
  return [...byId.values()];
}

export function saveRecord(key, seed, record) {
  const rows = readList(key, seed);
  const next = [...rows.filter((row) => row.id !== record.id), record];
  writeDemo(key, next);
  return next;
}
