export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: children.flat(Infinity).filter((child) => child !== false && child !== null && child !== undefined),
  };
}
