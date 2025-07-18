import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const containerMap = new WeakMap();

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);
  const previousRenderInfo = containerMap.get(container);

  let rootElement = null;

  if (!previousRenderInfo) {
    // create
    rootElement = createElement(normalizedVNode);

    container.innerHTML = "";
    container.appendChild(rootElement);
  } else {
    // update
    rootElement = updateElement(container, normalizedVNode, previousRenderInfo.vNode, 0);

    if (rootElement && rootElement !== previousRenderInfo.dom) {
      if (container.contains(previousRenderInfo.dom)) {
        container.replaceChild(rootElement, previousRenderInfo.dom);
      }
    } else if (rootElement === null && previousRenderInfo.dom) {
      if (container.contains(previousRenderInfo.dom)) {
        container.removeChild(previousRenderInfo.dom);
      }
    }
  }

  if (rootElement) {
    containerMap.set(container, {
      vNode: normalizedVNode,
      dom: rootElement,
    });
  } else {
    containerMap.delete(container);
    container.innerHTML = "";
  }

  setupEventListeners(container);
}
