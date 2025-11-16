const RANDOM_STRING_BASE = 36;
const RANDOM_STRING_START = 2;
const RANDOM_STRING_END = 9;

export function generateNoteId(): string {
  return `${Date.now()}-${Math.random().toString(RANDOM_STRING_BASE).substring(RANDOM_STRING_START, RANDOM_STRING_END)}`;
}
