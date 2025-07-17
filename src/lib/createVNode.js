export function createVNode(type, props, ...children) {
  children = children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false);

  return {
    type,
    props,
    children,
  };
}
