export function createVNode(type, props, ...children) {
  // children 배열을 완전히 평탄화하고 falsy 값들 제거
  const flattenedChildren = children
    .flat(Infinity)
    .filter((child) => child !== null && child !== undefined && child !== false && child !== true);
  return {
    type,
    props,
    children: flattenedChildren,
  };
}
