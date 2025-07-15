export function createVNode(type, props, ...children) {
  const vNode = {
    type: type,
    props,
    children: children.flat(Infinity).filter((node) => node === 0 || node),
  };

  return vNode;
}
