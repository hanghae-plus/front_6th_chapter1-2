import { addEvent } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode.js";
/*
 * 가상 DOM(Virtual DOM) 노드를 실제 DOM 요소로 변환하는 다리 역할
 * */
export function createElement(vNode) {
  // 1
  const nomalized = normalizeVNode(vNode);
  if (typeof nomalized === "string") {
    return document.createTextNode(nomalized);
  }
  // 2
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    for (const vNodeElement of vNode) {
      const vNodeElType = vNodeElement.type;
      fragment.appendChild(document.createElement(vNodeElType));
    }
    return fragment;
  }
  // 3
  if (typeof vNode?.type === "function") {
    throw new Error("vNode.type is function !!");
  }
  // 4
  // 함수 컴포넌트는 이미 걸러짐
  if (typeof vNode === "object" && typeof vNode.type === "string") {
    const el = document.createElement(vNode.type);
    // 속성 업데이트
    updateAttributes(el, vNode.props || {});
    // 자식 또한 부모와 동일하게
    for (const child of vNode.children) {
      el.appendChild(createElement(child));
    }
    return el;
  }
}

// element 생성 후 속성 update
function updateAttributes($el, props) {
  Object.entries(props).forEach(([attr, value]) => {
    if (attr.startsWith("on") && typeof value === "function") {
      const eventType = attr.toLowerCase().slice(2);
      addEvent($el, eventType, value);
    } else if (["checked", "disabled", "selected", "readOnly"].includes(attr)) {
      $el[attr] = Boolean(value);
    } else if (attr === "className") {
      value ? $el.setAttribute("class", value) : $el.removeAttribute("class");
    } else if (attr === "style" && typeof value === "object") {
      Object.assign($el.style, value);
    } else {
      $el.setAttribute(attr, value);
    }
  });
}
