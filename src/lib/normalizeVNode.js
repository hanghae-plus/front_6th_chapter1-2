/** @typedef {import('./type').VNode} VNode */
import { isThenable } from "../utils";
import {
  getCachedResult,
  setCachedResult,
  createCacheKey,
  triggerRerender,
  enterSuspenseContext,
  exitSuspenseContext,
} from "./suspenseContext";

/**
 * 가상 DOM 노드를 표준화하는 함수입니다.
 * 노드의 구조를 일관된 형태로 변환하고, 유효하지 않은 값들을 필터링합니다.
 *
 * @param {VNode} vNode - 표준화할 가상 DOM 노드
 * @param {boolean} insideSuspense - Suspense 컨텍스트 내부 여부
 * @returns {Promise<VNode>|VNode} 표준화된 가상 DOM 노드
 */
export async function normalizeVNode(vNode, insideSuspense = false) {
  // null, undefined, boolean 처리
  if (vNode == null || vNode === undefined || vNode === true || vNode === false) {
    return "";
  }

  // 나머지 원시타입 정리
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  /**
   * Bigint / Symbol 타입은 문자열로 변환
   */
  if (typeof vNode !== "object") {
    return String(vNode);
  }

  /**
   * SuspenseWrapper 처리 (함수 컴포넌트 체크보다 먼저 해야 함)
   */
  if (vNode.type && vNode.type.name === "SuspenseWrapper") {
    const { fallback } = vNode.props;
    const children = vNode.children; // children은 vNode.children에 있음
    const suspenseId = Math.random().toString(36).substr(2, 9);

    // Suspense 컨텍스트에 진입
    enterSuspenseContext({ id: suspenseId });

    try {
      // 자식 컴포넌트들을 정규화하려고 시도
      let normalizedChildren;

      if (Array.isArray(children)) {
        normalizedChildren = [];
        // 각 자식을 순차적으로 처리하여 Promise가 throw되면 즉시 catch
        for (const child of children) {
          const normalized = await normalizeVNode(child, true); // Suspense 컨텍스트 내부
          normalizedChildren.push(normalized);
        }
      } else {
        normalizedChildren = [await normalizeVNode(children, true)]; // Suspense 컨텍스트 내부
      }

      // 정상적으로 렌더링 완료
      exitSuspenseContext();

      return {
        type: "div",
        props: { "data-suspense": "resolved" },
        children: normalizedChildren,
      };
    } catch (error) {
      // Suspense 컨텍스트에서 탈출
      exitSuspenseContext();

      // Promise가 throw되면 fallback UI를 렌더링
      if (isThenable(error)) {
        return {
          type: "div",
          props: { "data-suspense": "pending" },
          children: [await normalizeVNode(fallback, false)], // fallback은 Suspense 외부에서 처리
        };
      }

      // 다른 에러는 그대로 throw
      throw error;
    }
  }

  /**
   * 함수 컴포넌트 처리
   * 함수 컴포넌트는 자식 노드를 포함하는 객체를 반환하므로 재귀적으로 처리
   */
  if (typeof vNode.type === "function") {
    const props = { ...vNode.props };
    if (vNode.children?.length > 0) {
      props.children = await Promise.all(
        vNode.children.map(async (child) => await normalizeVNode(child, insideSuspense)),
      );
    }

    // 캐시 키 생성
    const cacheKey = createCacheKey(vNode.type, props);

    // 캐시된 결과가 있는지 확인
    const cachedResult = getCachedResult(cacheKey);
    if (cachedResult && !isThenable(cachedResult)) {
      // 캐시된 결과가 있고 Promise가 아니라면 사용
      return await normalizeVNode(cachedResult, insideSuspense);
    }

    try {
      const result = vNode.type(props);

      if (isThenable(result)) {
        if (insideSuspense) {
          // Suspense 컨텍스트 내부라면 Promise를 캐시하고 throw
          setCachedResult(cacheKey, result);

          // Promise가 resolve되면 캐시 업데이트하고 리렌더링 트리거
          result
            .then((resolvedResult) => {
              setCachedResult(cacheKey, resolvedResult);
              triggerRerender();
            })
            .catch((error) => {
              console.error("Async component error:", error);
              setCachedResult(cacheKey, "");
              triggerRerender();
            });

          throw result; // Suspense가 캐치하도록 throw
        } else {
          // Suspense 컨텍스트 외부라면 기존처럼 await
          const resolvedResult = await result;
          setCachedResult(cacheKey, resolvedResult);
          return await normalizeVNode(resolvedResult, insideSuspense);
        }
      }

      // 동기 컴포넌트 결과 처리
      setCachedResult(cacheKey, result);
      return await normalizeVNode(result, insideSuspense);
    } catch (error) {
      // Promise throw는 Suspense에서 처리하므로 다시 throw
      if (isThenable(error)) {
        throw error;
      }
      console.error(error);
      return "";
    }
  }

  /**
   * children 정규화 및 falsy 값 필터링
   */
  const normalizedChildren = Array.isArray(vNode.children)
    ? (await Promise.all(vNode.children.map(async (child) => await normalizeVNode(child, insideSuspense)))).filter(
        (child) => child !== "" && child != null,
      )
    : vNode.children
      ? [await normalizeVNode(vNode.children, insideSuspense)]
      : [];

  /**
   * 빈 배열이면 undefined로 설정
   */
  const children = normalizedChildren.length > 0 ? normalizedChildren : undefined;

  return {
    type: vNode.type,
    props: vNode.props || null,
    children,
  };
}
