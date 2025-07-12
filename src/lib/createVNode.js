// 재귀를 이용하여 무한(depth: Infinity) 평탄화
// ex: [1, [2, [3, 4]], 5] -> [1, 2, 3, 4, 5]
const flatten = (arr) =>
  arr.reduce((acc, item) => {
    return Array.isArray(item) ? acc.concat(flatten(item)) : acc.concat(item);
  }, []);

export function createVNode(type, props, ...children) {
  // JSX에서 전달되는 children의 유형: Custom Component, Intrinsic Element, String, Number, Boolean, Null, Undefined
  // flatten: depth 끝까지 평탄화하여 한 단계 배열로 만듦 -> 순회 효율성을 위함
  const flatChildren = flatten(children);
  return {
    type,
    props: props || null, // props가 없으면 null로 처리
    children: flatChildren,
  };
}
