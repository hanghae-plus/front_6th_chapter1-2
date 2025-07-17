import { addEvent } from "./eventManager";

/**
 * 가상 노드를 기반으로 DOM 요소를 생성하는 함수
 * @param {any} vNode - 가상 노드
 * @returns {Element} 생성된 DOM 요소
 */
export function createElement(vNode) {
  // null, undefined, boolean 값 처리
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 문자열 혹은 숫자인 경우 텍스트 노드를 생성해 반환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode.toString());
  }

  // 함수형 컴포넌트는 처리할 수 없음
  if (typeof vNode === "function") {
    throw new Error("함수형 컴포넌트는 처리할 수 없습니다.");
  }

  // 배열 타입인 경우 DocumentFragment 생성
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => fragment.appendChild(createElement(child)));
    return fragment;
  }

  // 실제 DOM 요소 생성
  const el = document.createElement(vNode.type);

  updateAttributes(el, vNode.props);

  vNode.children?.forEach((child) => {
    const childEl = createElement(child);
    if (childEl) el.appendChild(childEl);
  });

  return el;
}

function updateAttributes($el, props) {
  if (!props) return;

  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      addEvent($el, eventType, value);
      return;
    }

    if (key === "className") {
      $el.setAttribute("class", value);
      return;
    }

    // boolean 처리
    if (typeof value === "boolean") {
      if (value) {
        $el.setAttribute(key, "");
      }
      return;
    }

    // data-* 처리
    if (key.startsWith("data-")) {
      $el.setAttribute(key, value);
      return;
    }

    $el.setAttribute(key, value);
  });
}
