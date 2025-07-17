import { addEvent } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";

export function createElement(vNode) {
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();

    vNode.forEach((v) => {
      const element = document.createElement(v.type);
      v.children.forEach((child) => element.appendChild(createElement(child)));
      fragment.appendChild(element);
    });
    return fragment;
  }
  const normalizedVNode = normalizeVNode(vNode);

  if (typeof normalizedVNode === "string") return document.createTextNode(normalizedVNode);

  if (typeof vNode.type === "function") throw Error;

  const element = document.createElement(vNode.type);
  if (vNode.props) updateAttributes(element, vNode.props);
  vNode.children.forEach((child) => {
    element.appendChild(createElement(child));
  });

  return element;
}

function updateAttributes($el, props) {
  for (const [key, value] of Object.entries(props || {})) {
    let normalizedKey = key === "className" ? "class" : key;

    if (normalizedKey.startsWith("on") && typeof value === "function") {
      const eventType = normalizedKey.substring(2).toLowerCase();
      addEvent($el, eventType, value);
      continue;
    }
    if (typeof value === "boolean") {
      if (value) $el.setAttribute(normalizedKey, "");
      continue;
    }
    if (value !== undefined && value !== null) {
      $el.setAttribute(normalizedKey, value);
    }
  }
}
