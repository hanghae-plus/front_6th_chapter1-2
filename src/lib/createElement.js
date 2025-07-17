import { addEvent } from "./eventManager";

export function createElement(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();

    vNode.forEach((node) => fragment.appendChild(createElement(node)));

    return fragment;
  }

  const el = document.createElement(vNode.type);
  updateAttributes(el, vNode.props ?? {});

  el.append(...vNode.children.map(createElement));

  return el;
}

function updateAttributes($el, props) {
  Object.entries(props).forEach(([attribute, value]) => {
    if (/^on[A-Z]/.test(attribute) && typeof value === "function") {
      addEvent($el, attribute.toLowerCase().substring(2), value);
    } else if (attribute === "className") {
      $el.setAttribute("class", value);
    } else if (attribute.startsWith("data-")) {
      $el.setAttribute(attribute, value);
    } else if (typeof value === "boolean") {
      if (value) {
        $el.setAttribute(attribute, "");
      }
    } else {
      $el.setAttribute(attribute, value);
    }
  });
}
