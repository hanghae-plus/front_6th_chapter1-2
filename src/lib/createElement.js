import { addEvent } from "./eventManager";

export function createElement(vNode) {
  if (vNode === undefined || vNode === null || typeof vNode === "boolean") return document.createTextNode("");

  if (vNode.type && typeof vNode.type === "function") {
    throw new Error("컴포넌트를 createElement로 처리할 수 없다.");
  }

  if (typeof vNode === "string" || typeof vNode === "number") return document.createTextNode(vNode);

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((node) => {
      fragment.appendChild(createElement(node));
    });
    return fragment;
  }

  if (typeof vNode === "object" && vNode.type) {
    const elementType = vNode.type;
    const $el = document.createElement(elementType);

    if (vNode.props) updateAttributes($el, vNode.props);

    if (vNode.children) {
      const childrenElement = vNode.children.map(createElement);
      childrenElement.forEach((childElement) => $el.appendChild(childElement));
    }

    return $el;
  }
}

function updateAttributes($el, props) {
  if (!props) return $el;

  const targetElement = $el;

  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith("on") && typeof value === "function") {
      addEvent(targetElement, key.slice(2).toLowerCase(), value);
    } else if (key === "className") {
      targetElement.className = value;
    } else {
      targetElement.setAttribute(key, value);
    }
  });

  return targetElement;
}
