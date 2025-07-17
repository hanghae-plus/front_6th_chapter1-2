import { addEvent } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";

export function createElement(vNode) {
  if (
    typeof vNode === "string" ||
    typeof vNode === "number" ||
    typeof vNode === "boolean" ||
    vNode === null ||
    vNode === undefined
  ) {
    return document.createTextNode(normalizeVNode(vNode));
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    const flatChildren = vNode.flat(Infinity);
    flatChildren.forEach((child) => {
      // undefined/null/false/true 등을 제거
      if (child !== null && child !== undefined && child !== false && child !== true) {
        fragment.appendChild(createElement(child));
      }
    });
    return fragment;
  }

  if (typeof vNode.type === "function") {
    throw new Error("Function components must be normalized first.");
  }

  const $el = document.createElement(vNode.type);
  updateAttributes($el, vNode.props);

  (vNode.children || []).forEach((child) => {
    if (child !== null && child !== undefined && child !== false && child !== true) {
      $el.appendChild(createElement(child));
    }
  });

  return $el;
}

function updateAttributes($el, props) {
  if (!props) return;
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase(); // onClick → click
      addEvent($el, eventType, value);
    } else if (key === "className") {
      $el.setAttribute("class", value);
    } else if (typeof value === "boolean") {
      // boolean 속성은 true일 때만 set
      if (value) $el.setAttribute(key, "");
    } else if (key.startsWith("data-")) {
      $el.setAttribute(key, value);
    } else {
      $el.setAttribute(key, value);
    }
  });
}
