// 재귀를 이용하여 depth 무한 평탄화
// ex: [1, [2, [3, 4]], 5] -> [1, 2, 3, 4, 5]

import type { Child, VNode } from "../types";

// 'any'를 사용한 실용적인 이유: arr는 타입추론이 어려워서 타입정의가 가독성을 해칠 수 있고, 다른 로직 사용에 큰 영향을 주지 않음
const flatten = (arr: any[]): any[] => {
  return arr.reduce((acc: any[], item: any): any[] => {
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

export function createVNode(type: string | Function, props: Record<string, any> | null, ...children: Child[]): VNode {
  const flatChildren = flatten(children) as Child[];
  return {
    type,
    props: props || null,
    children: flatChildren,
  };
}
