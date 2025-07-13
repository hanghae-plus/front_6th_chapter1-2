export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: Array.isArray(children) ? children : [children],
  };
}
