//createElement함수는 가상돔을 돔으로 변환해주는 것
//import { addEvent } from "./eventManager";

export function createElement(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });
    return fragment;
  }

  const $el = document.createElement(vNode.type);
  Object.entries(vNode.props).forEach(([key, value]) => {
    if (key.startsWith("on")) {
      const eventName = key.slice(2).toLowerCase();
      $el.addEventListener(eventName, value);
    } else if (key === "className") {
      $el.setAttribute("class", value);
    } else {
      $el.setAttribute(key, value);
    }
  });

  if (vNode.children) {
    vNode.children.forEach((child) => {
      $el.appendChild(createElement(child));
    });
  }
  return $el;
}

//function updateAttributes($el, props) {}
