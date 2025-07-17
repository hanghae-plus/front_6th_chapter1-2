export function flattenChildren(children) {
  if (!children) return [];
  if (!Array.isArray(children)) return [children];

  return children.flat(Infinity).filter((child) => child !== false && child !== null && child !== undefined);
}
