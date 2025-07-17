import { addEvent } from "./eventManager";

export function createElement(vNode) {
  // null, undefined, boolean 값들은 빈 텍스트 노드로 변환
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }
  // 문자열이나 숫자는 텍스트 노드로 변환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }
  // 배열은 DocumentFragment로 처리 (여러 자식 요소를 한번에 추가할 때 효율적)
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      const childElement = createElement(child);
      if (childElement) fragment.appendChild(childElement);
    });
    return fragment;
  }
  // 함수형 컴포넌트는 이미 정규화되어야 함
  if (typeof vNode.type === "function") {
    throw new Error("컴포넌트는 normalizeVNode로 먼저 정규화해야 합니다.");
  }
  // 실제 DOM 요소 생성
  const $el = document.createElement(vNode.type);
  // 속성들 적용
  if (vNode.props) updateAttributes($el, vNode.props);
  // 자식 요소들 처리
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
      // 이벤트 핸들러는 이벤트 위임 시스템에 등록
      const eventType = key.toLowerCase().substring(2);
      addEvent($el, eventType, value);
    } else if (key === "className") {
      $el.className = value;
    } else if (key === "checked" || key === "disabled" || key === "selected" || key === "readOnly") {
      // boolean 속성들은 property로 설정 (attribute와 property가 다름)
      $el.removeAttribute(key);
      $el[key] = !!value;
    } else if (key === "value" && ($el.tagName === "INPUT" || $el.tagName === "TEXTAREA" || $el.tagName === "SELECT")) {
      // form 요소들의 value는 property로 설정해야 함
      $el.value = value;
    } else if (value !== null && value !== undefined) {
      $el.setAttribute(key, value);
    }
  });
}
