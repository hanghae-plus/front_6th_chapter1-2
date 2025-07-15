import { addEvent, removeEvent } from "./eventManager";

// 속성 설정 함수
export function setAttribute(target, key, value) {
  if (key.startsWith("on") && typeof value === "function") {
    const eventType = key.slice(2).toLowerCase();

    addEvent(target, eventType, value);
  } else if (key === "className") {
    target.setAttribute("class", value);
  } else if (key === "style") {
    Object.assign(target.style, value);
  } else if (value === true) {
    target[key] = true;
  } else if (value === false) {
    target[key] = false;
  } else {
    target.setAttribute(key, value);
  }
}

// 속성 제거 함수
export function removeAttribute(target, key, value) {
  if (key.startsWith("on")) {
    const eventType = key.slice(2).toLowerCase();
    removeEvent(target, eventType, value);
  } else if (key === "className") {
    target.removeAttribute("class");
  } else if (key === "style") {
    target.style = {};
  } else if (value === true || value === false) {
    delete target[key];
  } else {
    target.removeAttribute(key);
  }
}

export function createElement(vNode) {
  if (vNode === undefined || vNode === null || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode);
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();

    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });

    return fragment;
  }

  const $element = document.createElement(vNode.type);

  if (vNode.props) {
    Object.entries(vNode.props).forEach(([key, value]) => {
      setAttribute($element, key, value);
    });
  }

  $element.append(...vNode.children.map((child) => createElement(child)));

  return $element;
}
