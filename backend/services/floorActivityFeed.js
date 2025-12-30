const FLOOR_KEYS = ['floor1', 'floor2', 'floor3'];
const MAX_ITEMS_PER_FLOOR = 60;

const store = new Map(FLOOR_KEYS.map((key) => [key, []]));

function normalizeFloor(value) {
  if (!value) return null;
  const raw = String(value).toLowerCase();
  if (raw === 'floor1' || raw === 'floor-1' || raw === 'f1') return 'floor1';
  if (raw === 'floor2' || raw === 'floor-2' || raw === 'f2') return 'floor2';
  if (raw === 'floor3' || raw === 'floor-3' || raw === 'f3') return 'floor3';
  return FLOOR_KEYS.includes(raw) ? raw : null;
}

function coerceDate(value) {
  if (!value) return new Date();
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return new Date();
  return date;
}

function recordFloorEvent({ floor, message, occurredAt, source, metadata } = {}) {
  if (!message) return null;
  const targetFloor = normalizeFloor(floor) || 'floor1';
  const bucket = store.get(targetFloor);
  const timestamp = coerceDate(occurredAt);
  const entry = {
    id: `${targetFloor}-${timestamp.getTime()}-${Math.floor(Math.random() * 1000)}`,
    floor: targetFloor,
    message: String(message).trim(),
    occurredAt: timestamp.toISOString(),
    source: source || null,
    metadata: metadata || null
  };
  bucket.unshift(entry);
  while (bucket.length > MAX_ITEMS_PER_FLOOR) {
    bucket.pop();
  }
  return entry;
}

function getFloorEvents({ floors, limit } = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 30, 120));
  const keys = Array.isArray(floors) && floors.length
    ? floors.map(normalizeFloor).filter(Boolean)
    : FLOOR_KEYS.slice();
  const combined = keys.flatMap((key) => store.get(key) || []);
  combined.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  return combined.slice(0, safeLimit);
}

module.exports = {
  recordFloorEvent,
  getFloorEvents
};
