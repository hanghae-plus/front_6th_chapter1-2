import { flattenArray } from "../utils/nodeUtils";

export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: flattenArray(children),
  };
}
