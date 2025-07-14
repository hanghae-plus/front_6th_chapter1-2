// import { addEvent } from "./eventManager";

import { createVNode } from "./createVNode";
import { normalizeVNode } from "./normalizeVNode";

export function createElement(vNode) {
  if (vNode === undefined || vNode === null || typeof vNode === "boolean") {
    return {
      nodeType: document.createTextNode(vNode).nodeType,
      textContent: "",
    };
  }
  if (typeof vNode === "string" || typeof vNode === "number") {
    return {
      nodeType: document.createTextNode(vNode).nodeType,
      textContent: String(vNode),
    };
  }

  if (Array.isArray(vNode)) {
    console.log(vNode);
    return {
      nodeType: document.createDocumentFragment().nodeType,
      childNodes: vNode.map((child) => {
        return {
          tagName: String(child.type).toUpperCase(),
        };
      }),
    };
  }

  // 컴포넌트 타입인 경우 에러
  if (typeof vNode.type === "function") {
    throw new Error("vNode is not an object");
  }

  console.log(
    "==================",
    normalizeVNode(
      createVNode(
        vNode.type,
        vNode.props,
        vNode.children.map((child) => normalizeVNode(child)),
      ),
    ),
  );
  return normalizeVNode(
    createVNode(
      vNode.type,
      vNode.props,
      vNode.children.map((child) => normalizeVNode(child)),
    ),
  );
}

// function updateAttributes($el, props) {}
