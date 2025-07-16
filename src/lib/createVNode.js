export function createVNode(type, props, ...children) {
  return { type, props, children: children.flat(2).filter((child) => ![null, undefined, false].includes(child)) };
}
