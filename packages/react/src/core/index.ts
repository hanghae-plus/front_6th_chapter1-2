import { createVNode } from "./createVNode.ts";

export * from "./createVNode";
export * from "./normalizeVNode";
export * from "./types";

export const createElement = createVNode;
