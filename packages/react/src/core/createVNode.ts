import { VNode, VNodeProps, VNodeChild, VNodeType } from "./types";

export function createVNode(type: VNodeType, props: VNodeProps | null, ...children: VNodeChild[]): VNode {
  return {
    type,
    props,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: (children as any).flat(Infinity).filter((value: VNodeChild) => value === 0 || Boolean(value)),
  };
}
