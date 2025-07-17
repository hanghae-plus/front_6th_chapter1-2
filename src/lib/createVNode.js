import { flattenChildren } from "./utils";

export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: flattenChildren(children),
  };
}

/*
테스트
- 중첩된 배열을 완전히 평탄화
- false, null, undefined 같은 falsy 값은 제거
 */
