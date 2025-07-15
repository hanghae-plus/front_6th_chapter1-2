import { isNotRenderable } from "../utils/typeCheck";

export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: flattenRenderableChildren(children),
  };
}

function flattenRenderableChildren(children) {
  const result = [];

  const flatten = (value) => {
    if (isNotRenderable(value)) {
      return;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        flatten(value[i]);
      }
    } else {
      result.push(value);
    }
  };

  flatten(children);
  return result;
}
