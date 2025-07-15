import { isFunction, isVNode, isNullish, isNumber, isString } from "../utils/typeCheck";
import { updateAttribute } from "../utils/updateAttribute";

export function createElement(vNode) {
  if (isString(vNode) || isNumber(vNode)) {
    return document.createTextNode(vNode);
  }

  if (Array.isArray(vNode)) {
    const fragment = new DocumentFragment();
    for (let i = 0; i < vNode.length; i++) {
      const $el = createElement(vNode[i]);
      fragment.appendChild($el);
    }
    return fragment;
  }

  if (isVNode(vNode)) {
    return createElementFromJSX(vNode);
  }

  return document.createTextNode("");
}

function setAttributes($el, props) {
  const entries = Object.entries(props ?? {});

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    updateAttribute($el, key, value);
  }
}

function updateChildren($el, children) {
  for (let i = 0; i < children.length; i++) {
    if (!isNullish(children[i])) {
      const $child = createElement(children[i]);
      $el.appendChild($child);
    }
  }
}

function createElementFromJSX(vNode) {
  const { type, props, children } = vNode;

  if (isFunction(type)) {
    throw new TypeError("createElement 함수는 컴포넌트를 처리할 수 없습니다.");
  }

  const $el = document.createElement(type);
  setAttributes($el, props);
  updateChildren($el, children);
  return $el;
}
