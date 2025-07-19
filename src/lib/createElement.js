import { addEvent } from "./eventManager";

/**
 * 
 * @param {function} createElement(vnode):
  IF vnode가 null/undefined/boolean:
    RETURN document.createTextNode('')
  
  IF vnode가 string/number:
    RETURN document.createTextNode(String(vnode))
  
  IF vnode가 배열:
    DocumentFragment 생성
    각 요소를 createElement로 재귀 변환하여 추가
    RETURN fragment
  
  IF vnode.type이 함수:
    ERROR 발생 (정규화 후 사용하라고 안내)
  
  ELSE (HTML 태그):
    element = document.createElement(vnode.type)
    updateAttributes(element, vnode.props) 호출
    각 child를 createElement로 재귀 변환하여 appendChild
    RETURN element} vNode 
 */

export function createElement(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode.toString());
  }

  if (Array.isArray(vNode)) {
    const fragment = new DocumentFragment();

    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });

    return fragment;
  }

  if (typeof vNode.type === "function") {
    throw new Error("Please normalize the vnode before creating an element.");
  }

  const $el = document.createElement(vNode.type);
  updateAttributes($el, vNode.props);

  vNode.children.forEach((child) => {
    $el.appendChild(createElement(child));
  });

  return $el;
}

function updateAttributes($el, props) {
  if (!props || typeof props !== "object") return;

  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined && value !== null) {
      if (key.startsWith("on") && typeof value === "function") {
        addEvent($el, key.slice(2).toLowerCase(), value);
      } else if (key === "className") {
        $el.className = value;
      } else if (key === "style" && typeof value === "object") {
        Object.assign($el.style, value);
      } else if (key === "selected" && $el.tagName === "OPTION") {
        // option 요소의 selected 속성은 DOM 프로퍼티로 설정
        $el.selected = Boolean(value);
      } else if (key === "checked" && $el.tagName === "INPUT" && ($el.type === "checkbox" || $el.type === "radio")) {
        // checkbox, radio의 checked 속성은 DOM 프로퍼티로 설정
        $el.checked = Boolean(value);
      } else if (
        key === "value" &&
        ($el.tagName === "INPUT" || $el.tagName === "SELECT" || $el.tagName === "TEXTAREA")
      ) {
        // input, select, textarea의 value는 DOM 프로퍼티로 설정
        $el.value = value;
      } else {
        $el.setAttribute(key, value);
      }
    } else {
      $el.setAttribute(key, value);
    }
  }
}
