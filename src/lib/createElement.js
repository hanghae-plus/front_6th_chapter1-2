import { addEvent } from "./eventManager";

// VirtualDOM을 RealDOM으로 변환
export function createElement(vNode) {
  // null, undefined, boolean 값은 빈 텍스트 노드로 변환
  if (typeof vNode === "boolean" || vNode === null || vNode === undefined) {
    return document.createTextNode("");
  }
  // 문자열과 숫자는 텍스트 노드로 변환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode);
  }

  // 배열은 DocumentFragment를 생성하여 변환
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();

    vNode.forEach((child) => {
      const el = createElement(child);
      if (el) fragment.appendChild(el);
    });

    return fragment;
  }

  // 가상 DOM 처리
  if (typeof vNode === "object") {
    const $el = document.createElement(vNode.type);
    updateAttributes($el, vNode.props ?? {});

    const children = (vNode.children ?? []).map(createElement);
    children.forEach((child) => {
      if (child) $el.appendChild(child);
    });

    return $el;
  }
}

// 새 DOM 노드에 속성 세팅
function updateAttributes($el, props) {
  Object.entries(props).forEach(([attr, value]) => {
    if (attr === "className") {
      // class 속성 추가
      $el.setAttribute("class", value);
    } else if (typeof value === "boolean") {
      // boolean 속성 추가
      value && $el.setAttribute(attr, "");
    } else if (attr.startsWith("on")) {
      // 이벤트 함수 등록
      const eventType = attr.slice(2).toLowerCase();
      addEvent($el, eventType, value);
    } else {
      // 일반 속성 추가
      $el.setAttribute(attr, value);
    }
  });
}
