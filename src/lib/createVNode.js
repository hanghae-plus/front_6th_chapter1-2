export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: children.flat(Infinity).filter((v) => v !== null && v !== undefined && v !== false),
  };
}
