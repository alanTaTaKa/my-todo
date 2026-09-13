export function mergeById<T extends { id: string; updatedAt: number }>(
  current: T[],
  incoming: T[],
  isEqual: (a: T, b: T) => boolean,
): T[] {
  if (incoming.length === 0) return current

  const map = new Map(current.map((item) => [item.id, item]))
  let changed = false

  for (const remote of incoming) {
    const local = map.get(remote.id)
    if (!local) {
      map.set(remote.id, remote)
      changed = true
      continue
    }
    if (remote.updatedAt < local.updatedAt) continue
    if (remote.updatedAt === local.updatedAt && isEqual(local, remote)) continue
    map.set(remote.id, remote)
    changed = true
  }

  return changed ? Array.from(map.values()) : current
}
