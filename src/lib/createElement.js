// import { addEvent } from "./eventManager";

//

export function createElement(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    /**
     * createDocumentFragment
     */
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      // fragment.appendChild(createElement(child))
      const el = createElement(child);
      if (el instanceof Node) {
        fragment.appendChild(el);
      }
    });
    return fragment;
  }

  if (typeof vNode === "object" && typeof vNode.type === "string") {
    // const tag = createElement(vNode.type);
  }
}

// function updateAttributes($el, props) {}
