import { addEvent } from "./eventManager";

/**
 * 가상 DOM 노드를 실제 DOM 요소로 변환합니다.
 * 이 함수는 다양한 타입의 가상 노드(null, boolean, string, number, array, object)를 처리하여
 * 적절한 DOM 요소를 생성하고 반환합니다.
 *
 * @param {import('./createVNode').VNode | string | number | boolean | null | undefined} vNode - 변환할 가상 DOM 노드.
 * @returns {Node | null} 생성된 DOM 요소 또는 null.
 * @throws {Error} 정규화되지 않은 컴포넌트(함수 형태)가 전달될 경우 에러를 발생시킵니다.
 */
export function createElement(vNode) {
  // 1. null, undefined, boolean -> 빈 텍스트 노드
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 2. string, number -> 텍스트 노드
  //    - 숫자, 문자열은 텍스트 노드로 변환
  //    - 숫자는 문자열로 변환하여 처리
  //    - 문자열은 그대로 사용
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  // 3. 배열 -> DocumentFragment
  //   - 배열일 경우 각 요소를 createElement로 재귀 호출한 후 하나의 DocumentFragment로 반환
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      const childEl = createElement(child);
      if (childEl) {
        fragment.appendChild(childEl);
      }
    });
    return fragment;
  }

  // 4. 컴포넌트(vNode)인데 정규화되지 않은 경우 (type 이 function 인 상태)
  if (typeof vNode.type === "function") {
    throw new Error("컴포넌트는 정규화된 형태로 전달되어야 합니다. 현재는 함수 형태로 전달되었습니다.");
  }

  // 5. 객체 -> Element 생성
  if (typeof vNode === "object" && typeof vNode.type === "string") {
    const $el = document.createElement(vNode.type);

    if (vNode.props) {
      updateAttributes($el, vNode.props);
    }

    vNode.children?.forEach((child) => {
      const childEl = createElement(child);
      if (childEl) {
        $el.appendChild(childEl);
      }
    });

    return $el;
  }

  return null;
}

/**
 * DOM 요소의 속성을 설정하거나 업데이트합니다.
 * 이벤트 리스너, className, style 객체, 데이터 속성, 불리언 속성 등
 * 다양한 종류의 속성을 적절하게 처리합니다.
 *
 * @param {HTMLElement} $el - 속성을 적용할 DOM 요소.
 * @param {Object<string, any>} [props={}] - 적용할 속성 객체.
 */
function updateAttributes($el, props = {}) {
  Object.entries(props).forEach(([key, value]) => {
    // 1. 이벤트 처리 (예: onClick)
    if (/^on[A-Z]/.test(key)) {
      const eventName = key.slice(2).toLowerCase(); // onClick → click
      addEvent($el, eventName, value);
      return;
    }

    // 2. className → class
    if (key === "className") {
      $el.setAttribute("class", value);
      return;
    }

    // 3. style 객체 처리
    if (key === "style" && typeof value === "object") {
      Object.entries(value).forEach(([styleName, styleValue]) => {
        $el.style[styleName] = styleValue;
      });
      return;
    }

    // 4. data-* 속성 처리
    if (key.startsWith("data-")) {
      const dataKey = key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      $el.dataset[dataKey] = value;
      return;
    }

    // 5. boolean 속성 처리 (disabled, checked 등)
    if (typeof value === "boolean") {
      const needsAttr = key === "disabled" || key === "readOnly";
      const attrName = key === "readOnly" ? "readonly" : key;
      $el[key] = value;
      value && needsAttr ? $el.setAttribute(attrName, "") : $el.removeAttribute(attrName);
      return;
    }

    // 6. 기본 속성 처리
    $el.setAttribute(key, value);
  });
}
