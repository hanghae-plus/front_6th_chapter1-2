import type { RawChild, VElement, VElementProps } from "../types";

// 재귀를 이용하여 depth 무한 평탄화
// ex: [1, [2, [3, 4]], 5] -> [1, 2, 3, 4, 5]
const flatten = (arr: RawChild[]): RawChild[] => {
  return arr.reduce((acc: RawChild[], item: RawChild): RawChild[] => {
    const shouldNotRender = item == null || typeof item === "boolean";
    if (Array.isArray(item)) {
      return acc.concat(flatten(item));
    } else if (shouldNotRender) {
      // shouldNotRender(null, undefined, boolean)일 경우 배열에 추가하지 않음
      return acc;
    } else {
      return acc.concat(item);
    }
  }, []);
};

export function createVNode(type: string | Function, props: VElementProps, ...children: RawChild[]): VElement {
  const flatChildren = flatten(children);
  return {
    type,
    props: props || null,
    children: flatChildren,
  };
}
