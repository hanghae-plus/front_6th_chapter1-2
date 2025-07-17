import { CreateVNodeArgsType, VNodeType } from "./types";

/**
 * VNode 형태로 파싱되어서 오게 됨
 */

// VNodeType
export function createVNode(...args: CreateVNodeArgsType): VNodeType {
  const [element, props, ...children] = args;

  return {
    type: element,
    props,
    children: children.flatMap((v) => {
      if (Array.isArray(v)) {
        return v.flat();
      }

      if (v === null || v === undefined || typeof v === "boolean") {
        return [];
      }

      return v;
    }),
  };
}
