export interface MapLike<K, V> {
  set(key: K, value: V): void
  get(key: K): undefined | V
}

export function getOrInit<K, V>(
  container: MapLike<K, V>,
  key: K,
  init: () => V,
): V {
  let value = container.get(key)
  if (value === undefined) {
    value = init()
    container.set(key, value)
  }
  return value
}
