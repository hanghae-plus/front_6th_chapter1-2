import { addEvent } from "./eventManager";

function isTextish(value) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    value === null ||
    value === undefined ||
    typeof value === "boolean"
  );
}

function updateAttributes($el, props) {
  Object.entries(props).forEach(([key, value]) => {
    if (key === "key") return;

    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      addEvent($el, eventType, value);
      return;
    }

    if (key === "className") {
      $el.setAttribute("class", value);
      return;
    }

    if (typeof value === "boolean") {
      if (value) {
        $el[key] = true;
        $el.setAttribute(key, "");
      }
      return;
    }

    $el.setAttribute(key, value);
  });
}

export function createElement(vNode) {
  if (isTextish(vNode)) {
    const text = vNode == null || typeof vNode === "boolean" ? "" : vNode.toString();
    return document.createTextNode(text);
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      const childEl = createElement(child);
      fragment.appendChild(childEl);
    });
    return fragment;
  }

  if (typeof vNode === "object" && vNode !== null) {
    const { type, props = null, children = [] } = vNode;

    if (typeof type === "function") {
      throw new Error("Functional component needs to be normalized before passing to createElement");
    }

    const $el = document.createElement(type);

    if (props) {
      updateAttributes($el, props);
    }

    (children || []).forEach((child) => {
      const childEl = createElement(child);
      $el.appendChild(childEl);
    });

    return $el;
  }

  return document.createTextNode(String(vNode));
}
