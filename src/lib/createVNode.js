export function createVNode(type, props, ...children) {
  return {
    type: type,
    props: props,
    children: children.flat(2).filter((child) => child !== null && child !== undefined && child !== false),
  };
}
