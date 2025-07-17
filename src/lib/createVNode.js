export function createVNode(type, props, ...children) {
  if (props === undefined) props = null;
  const flatChildren = children
    .flat(Infinity)
    .filter((child) => child !== null && child !== undefined && child !== false && child !== true);
  return { type, props, children: flatChildren };
}
