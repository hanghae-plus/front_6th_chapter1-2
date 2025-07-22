export function createVNode(type, props, ...children) {
  const flatChildren = children.flat(Infinity).filter((child) => child === 0 || Boolean(child));

  return {
    type,
    props,
    children: flatChildren,
  };
}
