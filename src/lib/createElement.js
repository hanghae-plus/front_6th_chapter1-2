import { addEvent } from "./eventManager";

/**
 * 가상 DOM(vNode)을 실제 DOM 요소로 변환하는 함수
 */
export function createElement(vNode) {
  // 1. null, undefined, true, false → 빈 텍스트 노드
  if (vNode === null || vNode === undefined || vNode === false || vNode === true) {
    return document.createTextNode("");
  }

  // 2. 문자열, 숫자 → 텍스트 노드
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  // 3. 배열 → DocumentFragment
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });
    return fragment;
  }

  // 4. vNode 객체
  if (typeof vNode === "object" && vNode !== null && "type" in vNode) {
    // 함수형 컴포넌트는 직접 처리하면 오류
    if (typeof vNode.type === "function") {
      throw new Error("컴포넌트는 반드시 normalizeVNode로 정규화 후 createElement로 변환해야 합니다.");
    }

    // type이 문자열(태그명)인 경우
    const $el = document.createElement(vNode.type);

    // props 처리
    updateAttributes($el, vNode.props);

    // children 처리
    (vNode.children || []).forEach((child) => {
      $el.appendChild(createElement(child));
    });

    return $el;
  }

  // 5. 예외 상황: 빈 텍스트 노드 반환
  return document.createTextNode("");
}

/**
 * DOM 요소에 속성(props) 및 이벤트를 바인딩하는 함수
 */
function updateAttributes($el, props) {
  if (!props) return;
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith("on") && typeof value === "function") {
      // 이벤트 핸들러
      addEvent($el, key.slice(2).toLowerCase(), value);
    } else if (key === "className") {
      $el.setAttribute("class", value);
    } else if (key.startsWith("data-")) {
      $el.setAttribute(key, value);
    } else if (value === true) {
      $el.setAttribute(key, "");
    } else if (value === false || value == null) {
      // 아무것도 하지 않음
    } else {
      $el.setAttribute(key, value);
    }
  });
}
