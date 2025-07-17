import { addEvent } from "./eventManager";

export function createElement(vNode) {
  if (vNode === undefined || vNode === null || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode.toString());
  }

  // 배열 타입 처리
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    for (const child of vNode) {
      const childElement = createElement(child);
      if (childElement) {
        fragment.appendChild(childElement);
      }
    }
    return fragment;
  }

  // 중첩 처리
  if (typeof vNode === "object" && vNode !== null) {
    const element = document.createElement(vNode.type);
    updateAttributes(element, vNode.props);

    const children = vNode.children || [];
    for (const child of children) {
      const childElement = createElement(child);
      if (childElement) {
        element.appendChild(childElement);
      }
    }

    return element;
  }

  return null;
}

function updateAttributes($el, props) {
  if (!props) return;

  setAttributes($el, props);
}

export function setAttributes(el, props) {
  for (const key in props) {
    if (key.startsWith("on") && typeof props[key] === "function") {
      addEvent(el, key.toLowerCase().slice(2), props[key]);
    } else if (key === "className") {
      el.className = props[key];
    } else if (key === "disabled") {
      el.disabled = props[key];
    } else if (key === "checked") {
      el.checked = props[key];
    } else if (key === "selected") {
      if (props[key]) {
        el.selected = true;
      } else {
        el.selected = false;
      }
    } else if (key === "readOnly") {
      el.readOnly = props[key];
    } else if (key === "value") {
      el.value = props[key];
    } else if (key.startsWith("data-")) {
      el.setAttribute(key, props[key]);
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}
