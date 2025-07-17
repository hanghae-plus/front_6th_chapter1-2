export function flattenChildren(children) {
  return children.flat(Infinity).filter((child) => child !== false && child !== null && child !== undefined);
}
