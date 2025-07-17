import { isNil, isFalse } from "../utils";

export function createVNode(type, props, ...children) {
  const newChildren = children.flat(Infinity).filter((child) => !isNil(child) && !isFalse(child));
  return { type, props, children: newChildren };
}
