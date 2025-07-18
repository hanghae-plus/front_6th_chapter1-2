const AsyncFunction = async function () {}.constructor;

export function isAsyncFunction(value) {
  return value instanceof AsyncFunction;
}

/**
 * Promise like 객체인지 확인하는 함수입니다.
 * thenable 객체는 then 메서드를 가진 객체를 의미합니다.
 *
 * @param {any} value - 검사할 값
 * @returns {boolean} thenable 객체인지 여부
 */
export function isThenable(value) {
  return value != null && typeof value === "object" && typeof value.then === "function";
}
