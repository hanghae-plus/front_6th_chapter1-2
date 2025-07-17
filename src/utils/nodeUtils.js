/**
 * 배열 평탄화
 * @param {Array} arr - 평탄화할 배열
 * @returns {Array} 평탄화된 배열
 */
export function flattenArray(arr) {
  const result = [];

  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flattenArray(item));
    } else if (item !== null && item !== undefined && typeof item !== "boolean") {
      result.push(item); // falsy 값이 아닐 때만 추가, boolean 값도 제외
    }
  }

  return result;
}
