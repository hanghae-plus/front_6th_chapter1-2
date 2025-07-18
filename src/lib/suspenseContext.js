/**
 * Suspense 컨텍스트와 Promise 캐시를 관리하는 시스템
 */
import { isThenable } from "../utils";

// 현재 Suspense 컨텍스트 스택
let suspenseContextStack = [];

// Promise 캐시 (컴포넌트별로 결과를 캐시)
const promiseCache = new Map();

// 리렌더링 콜백 함수들
const rerenderCallbacks = new Set();

/**
 * 현재 Suspense 컨텍스트 내부에 있는지 확인
 * @returns {boolean}
 */
export function isInsideSuspenseContext() {
  return suspenseContextStack.length > 0;
}

/**
 * Suspense 컨텍스트에 진입
 * @param {Object} context - Suspense 컨텍스트 정보
 */
export function enterSuspenseContext(context) {
  suspenseContextStack.push(context);
}

/**
 * Suspense 컨텍스트에서 탈출
 */
export function exitSuspenseContext() {
  return suspenseContextStack.pop();
}

/**
 * 현재 Suspense 컨텍스트 가져오기
 * @returns {Object|null}
 */
export function getCurrentSuspenseContext() {
  return suspenseContextStack[suspenseContextStack.length - 1] || null;
}

/**
 * Promise 캐시에서 결과 가져오기
 * @param {string} key - 캐시 키
 * @returns {*} 캐시된 결과 또는 undefined
 */
export function getCachedResult(key) {
  return promiseCache.get(key);
}

/**
 * Promise 캐시에 결과 저장
 * @param {string} key - 캐시 키
 * @param {*} value - 저장할 값
 */
export function setCachedResult(key, value) {
  promiseCache.set(key, value);
}

/**
 * Promise 캐시 키 생성
 * @param {Function} component - 컴포넌트 함수
 * @param {Object} props - 컴포넌트 props
 * @returns {string} 캐시 키
 */
export function createCacheKey(component, props) {
  return `${component.name || "anonymous"}_${JSON.stringify(props)}`;
}

/**
 * 리렌더링 콜백 등록
 * @param {Function} callback - 리렌더링 콜백
 */
export function addRerenderCallback(callback) {
  rerenderCallbacks.add(callback);
}

/**
 * 리렌더링 콜백 제거
 * @param {Function} callback - 리렌더링 콜백
 */
export function removeRerenderCallback(callback) {
  rerenderCallbacks.delete(callback);
}

/**
 * 모든 리렌더링 콜백 실행
 */
export function triggerRerender() {
  rerenderCallbacks.forEach((callback) => {
    try {
      callback();
    } catch (error) {
      console.error("Rerender callback error:", error);
    }
  });
}

/**
 * Promise 캐시 초기화
 */
export function clearCache() {
  promiseCache.clear();
}

/**
 * isThenable 함수를 re-export
 */
export { isThenable };
