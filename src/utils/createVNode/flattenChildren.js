/**
 * 중첩된 배열 형태의 자식 노드들을 단일 레벨의 배열로 평탄화합니다.
 * 재귀적으로 배열을 탐색하여 모든 자식 노드를 하나의 배열에 담습니다.
 *
 * @param {Array<any>} children - 평탄화할 자식 노드들의 배열 (중첩될 수 있음).
 * @returns {Array<any>} 평탄화된 자식 노드들의 배열.
 */
export function flattenChildren(children) {
  const result = [];

  const stack = [...children];
  while (stack.length > 0) {
    const child = stack.shift();

    if (Array.isArray(child)) {
      stack.unshift(...child);
    } else {
      result.push(child);
    }
  }

  return result;
}
