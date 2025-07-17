/**
 * 주어진 자식 노드가 유효한지 확인합니다.
 * undefined, null, false, 빈 문자열('')은 유효하지 않은 자식으로 간주합니다.
 *
 * @param {any} child - 유효성을 검사할 자식 노드.
 * @returns {boolean} 자식 노드가 유효하면 true, 그렇지 않으면 false.
 */
export function isValidChild(child) {
  return child !== undefined && child !== null && child !== false && child !== "";
}
