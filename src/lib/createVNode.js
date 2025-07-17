// 재귀적으로 배열을 평탄화하고 falsy 값들을 필터링하는 함수
function flattenArray(arr) {
  const result = [];

  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flattenArray(item));
    } else if (item != null && item !== false && item !== undefined) {
      result.push(item);
    }
  }

  return result;
}

export function createVNode(type, props, ...children) {
  return { type, props, children: flattenArray(children) };
}
