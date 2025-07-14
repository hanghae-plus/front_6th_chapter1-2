export function createVNode(type, props, ...children) {
  const filterdChildren = children
    .flat(Infinity)
    .filter((v) => v != null && v !== false && v !== true);

  return {
    type,
    props,
    children: filterdChildren,
  };
}
