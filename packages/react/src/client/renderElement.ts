import { setupEventListeners } from "./eventManager.ts";
import { createElement } from "./createElement.ts";
import { normalizeVNode } from "../core/normalizeVNode.ts";
import { updateElement } from "./updateElement.ts";
import { VNodeChild } from "../core/types.ts";

const OldNodeMap = new WeakMap<Element, VNodeChild>();

export const renderElement = (vNode: VNodeChild, container: Element): void => {
  const oldNode = OldNodeMap.get(container);
  const newNode = normalizeVNode(vNode);

  if (!oldNode) {
    container.appendChild(createElement(newNode));
  } else {
    updateElement(container, newNode, oldNode);
  }

  OldNodeMap.set(container, newNode);
  setupEventListeners(container);
};
