import { isNil } from "../utils/isNil";

export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: children
      .flat(Number.POSITIVE_INFINITY)
      .filter((child) => !isNil(child))
      .filter((child) => child !== false),
  };
}
