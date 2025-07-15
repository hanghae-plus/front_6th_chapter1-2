/**
 * 동작 원리
 * vite.config.js에 설정된 jsxFactory가 createVNode를 호출하여 각 컴포넌트 파일 마다 flatten된 children 배열 생성
 */

import type { RawChild, VElement, VElementProps } from "../types";

// depth 무한 평탄화
// ex: [1, [2, [3, 4]], 5] -> [1, 2, 3, 4, 5]
const flatten = (arr: RawChild[]): RawChild[] => {
  return arr.flat(Infinity).filter((item) => {
    // shouldNotRender(null, undefined, boolean)일 경우 배열에 추가하지 않음
    const shouldNotRender = item == null || typeof item === "boolean";
    return !shouldNotRender;
  });
};

export function createVNode(type: string | Function, props: VElementProps, ...children: RawChild[]): VElement {
  const flatChildren = flatten(children) as RawChild[];
  console.log(flatChildren);

  return {
    type,
    props: props || null,
    children: flatChildren,
  };
}
