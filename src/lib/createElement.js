import { addEvent } from "./eventManager";

function setElement(el, props = {}) {
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith("data-")) {
      el.setAttribute(key, String(value));
    } else if (key.startsWith("on")) {
      addEvent(el, key.slice(2).toLowerCase(), value);
    } else if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
      el[key] = Boolean(value);
    } else if (key === "className") {
      el.setAttribute("class", value);
    } else if (key === "style" && typeof value === "object") {
      Object.assign(el.style, value);
    } else {
      el.setAttribute(key, value);
    }
  });

  return el;
}

export function createElement(vNode) {
  if (typeof vNode === "boolean" || typeof vNode === "undefined" || vNode === null) {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    const frag = document.createDocumentFragment();

    for (const node of vNode) {
      frag.appendChild(createElement(node));
    }

    return frag;
  }

  const el = setElement(document.createElement(vNode.type), vNode.props ?? {});
  el.append(...vNode.children.map(createElement));

  return el;
}
