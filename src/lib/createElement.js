import { addEvent } from "./eventManager";

export function createElement(vNode) {
  // null, undefined, boolean 처리
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode(""); // 빈 텍스트 노드로 변환
  }
  // 문자열, 숫자 처리
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }
  // 배열 처리
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      const childElement = createElement(child);
      if (childElement) fragment.appendChild(childElement);
    });
    return fragment;
  }
  // 함수형 컴포넌트는 허용하지 않음(테스트 요구)
  if (typeof vNode.type === "function") {
    throw new Error("컴포넌트는 normalizeVNode로 먼저 정규화해야 합니다.");
  }
  // 객체 타입 처리
  const $el = document.createElement(vNode.type);
  // props 적용
  if (vNode.props) updateAttributes($el, vNode.props);
  // children 처리
  if (vNode.children) {
    vNode.children.forEach((child) => {
      if (child !== null && child !== undefined && child !== false && child !== true) {
        const childElement = createElement(child);
        if (childElement) $el.appendChild(childElement);
      }
    });
  }
  return $el;
}

function updateAttributes($el, props) {
  Object.entries(props).forEach(([key, value]) => {
    if (key === "children") return;
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.toLowerCase().substring(2);
      addEvent($el, eventType, value);
    } else if (key === "className") {
      $el.className = value;
    } else if (key === "checked" || key === "disabled" || key === "selected" || key === "readOnly") {
      $el.removeAttribute(key); // 먼저 attribute 제거
      $el[key] = !!value; // 그 다음 property 설정
    } else if (key === "value" && ($el.tagName === "INPUT" || $el.tagName === "TEXTAREA" || $el.tagName === "SELECT")) {
      // input, textarea, select의 value는 property로 설정
      $el.value = value;
    } else if (value !== null && value !== undefined) {
      $el.setAttribute(key, value);
    }
  });
}
