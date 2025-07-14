// import { addEvent } from "./eventManager";

/**
 * @param {object} vNode { type, props, children }
 * @returns {Node} { nodeType, textContent}
 */
export function createElement(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  // "배열 입력에 대해 DocumentFragment를 생성해야 한다"
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });
  }
}

// function updateAttributes($el, props) {}
