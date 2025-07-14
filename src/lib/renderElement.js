import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const renderStateMap = new WeakMap();

const isFirstRender = (container) => {
  return !renderStateMap.has(container);
};

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);

  if (isFirstRender(container)) {
    const $el = createElement(normalizedVNode);
    container.appendChild($el);
    renderStateMap.set(container, {
      hasRendered: true,
      lastVNode: normalizedVNode,
    });
  } else {
    const renderState = renderStateMap.get(container);
    updateElement(container, normalizedVNode, renderState.lastVNode);
    renderState.lastVNode = normalizedVNode;
  }

  setupEventListeners(container);
}
