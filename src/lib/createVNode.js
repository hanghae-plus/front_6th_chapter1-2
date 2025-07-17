import { isFalsy } from "../utils/isFalsy";

export function createVNode(type, props, ...children) {
  if (isFalsy(type)) return "";

  return {
    type,
    props,
    children: children.filter((child) => !isFalsy(child)).flat(Infinity),
  };
}
