export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: children.flat(Infinity).filter((child) => child !== undefined && child !== null && child !== false),
  };
}
