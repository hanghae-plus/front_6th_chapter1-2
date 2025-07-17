export function createVNode(type, props, ...children) {
  const flatChildren = children.flat(Infinity);
  const filteredChildren = flatChildren.filter(
    (child) => child !== null && child !== undefined && typeof child !== "boolean",
  );

  return { type, props, children: filteredChildren };
}
