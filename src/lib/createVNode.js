export function createVNode(type, props, ...children) {
  const flatChildren = children
    .flat(Infinity)
    .filter((child) => child !== undefined && child !== null && child !== false);

  return {
    type,
    props: props ?? null,
    children: flatChildren,
  };
}
