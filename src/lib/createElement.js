import { addEvent } from "./eventManager";
export function createElement(vNode) {
  if (vNode == null || typeof vNode === "boolean") return document.createTextNode("");

  if (typeof vNode === "string" || typeof vNode === "number") return document.createTextNode(String(vNode));

  if (typeof vNode === "function") throw new Error("컴포넌트는 안돼용");
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });
    return fragment;
  }
  const $el = document.createElement(vNode.type);
  updateAttributes($el, vNode.props);
  (vNode.children || []).forEach((child) => {
    $el.appendChild(createElement(child));
  });
  return $el;
}

function updateAttributes($el, props) {
  if (!props) return;
  Object.entries(props).forEach(([key, value]) => {
    if (key === "className") {
      $el.setAttribute("class", value);
    } else if (key.startsWith("data-")) {
      $el.setAttribute(key, value);
    } else if (key in $el) {
      $el[key] = value;
    } else if (key.startsWith("on")) {
      addEvent($el, key.slice(2).toLowerCase(), value);
    } else {
      $el.setAttribute(key, value);
    }
  });
}
