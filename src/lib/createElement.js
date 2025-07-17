import { addEvent } from "./eventManager";

export function createElement(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode.toString());
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });
    return fragment;
  }

  const $el = document.createElement(vNode.type);
  updateAttributes($el, vNode.props ?? {});

  vNode.children.forEach((child) => {
    $el.appendChild(createElement(child));
  });

  return $el;
}

function updateAttributes($el, props) {
  Object.entries(props).forEach(([key, value]) => {
    if (key === "className") {
      $el.setAttribute("class", value);
    } else if (key.startsWith("on") && typeof value === "function") {
      const event = key.slice(2).toLowerCase(); // onClick -> click
      addEvent($el, event, value);
    } else if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
      $el[key] = Boolean(value);
    } else {
      $el.setAttribute(key, value);
    }
  });
}
