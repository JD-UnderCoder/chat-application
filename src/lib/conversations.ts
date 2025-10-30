export function conversationIdFromUids(a: string, b: string) {
  return [a, b].sort().join("__");
}