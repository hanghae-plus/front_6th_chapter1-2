import { renderElement } from "./renderElement";
import { VNode } from "../core";

export * from "./createElement";
export * from "./eventManager";
export * from "./renderElement";
export * from "./updateElement";

export const createRoot = (element: Element) => ({
  render: (node: VNode) => renderElement(node, element),
});

export default {
  createRoot,
};
