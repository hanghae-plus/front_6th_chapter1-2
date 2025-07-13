// VirtualDOM 생성
export function createVNode(type, props, ...children) {
  return { type, props, children: children.flat() };
}
