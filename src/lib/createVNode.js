export function createVNode(type, props, ...children) {
  const flatChildren = children
    .flat(Infinity)
    .filter((child) => child !== undefined && child !== null && child !== false);

  console.log("flatChildren", flatChildren);
  return {
    type,
    props: props ?? null,
    children: flatChildren,
  };
}
