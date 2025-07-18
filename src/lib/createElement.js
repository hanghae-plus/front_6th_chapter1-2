import { addEvent } from "./eventManager";

function updateAttributes($el, props) {
  for (const key in props) {
    const value = props[key];

    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.toLowerCase().substring(2);
      addEvent($el, eventType, value);
      continue;
    }

    switch (key) {
      case "style":
        for (const sKey in value) {
          $el.style[sKey] = value[sKey];
        }
        break;
      case "className":
        $el.setAttribute("class", String(value));
        break;
      case "checked":
        $el.checked = !!value;
        break;
      case "disabled":
      case "selected":
      case "readOnly":
        $el[key] = !!value;
        break;
      default:
        $el.setAttribute(key, value);
    }
  }
}

export function createElement(vNode) {
  if (vNode === null || vNode === undefined) {
    return document.createTextNode("");
  }

  switch (typeof vNode) {
    case "boolean":
      return document.createTextNode("");
    case "string":
    case "number":
      return document.createTextNode(String(vNode));
    case "object":
      if (Array.isArray(vNode)) {
        const fragment = document.createDocumentFragment();

        vNode.forEach((child) => {
          const childElement = createElement(child);
          fragment.appendChild(childElement);
        });
        return fragment;
      }
      if (typeof vNode.type === "function") {
        throw new Error();
      }
      if (typeof vNode.type === "string") {
        const element = document.createElement(vNode.type);

        updateAttributes(element, vNode.props);

        vNode.children.forEach((child) => {
          const childElement = createElement(child);
          element.appendChild(childElement);
        });
        return element;
      }
  }
}
