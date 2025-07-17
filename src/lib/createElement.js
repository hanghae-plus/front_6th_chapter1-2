import { isArray, isFalsy } from "../utils";
import { setElementAttributes } from "./setElementAttributes";

const createTextNode = (text) => document.createTextNode(text);

const updateAttributes = ($el, props) => {
  if (isFalsy(props)) return;

  setElementAttributes($el, props);
};

const updateChildren = ($el, vNode) => {
  for (const child of vNode.children) {
    $el.appendChild(createElement(child));
  }

  $el._vNode = vNode;

  return $el;
};

const createDOMElement = (vNode) => {
  const $el = document.createElement(vNode.type);

  updateAttributes($el, vNode.props);
  updateChildren($el, vNode);

  return $el;
};

const createFragment = (vNode) => {
  const fragment = document.createDocumentFragment();
  for (const child of vNode) {
    fragment.appendChild(createElement(child));
  }
  return fragment;
};

const createComponent = (vNode) => {
  if (isArray(vNode)) {
    const componentResult = vNode.type(vNode.props);
    return createElement(componentResult);
  }
  return createElement(vNode);
};

const handlers = {
  string: createTextNode,
  number: createTextNode,
  object: (vNode) => {
    if (isArray(vNode)) return createFragment(vNode);
    if (isArray(vNode.type)) return createComponent(vNode);
    if (vNode.type) return createDOMElement(vNode);
    return "";
  },
};

export function createElement(vNode) {
  if (isFalsy(vNode)) return createTextNode("");

  const handler = handlers[typeof vNode];
  if (!handler) {
    console.error(`Unsupported vNode type: ${typeof vNode}`, vNode);
    return createTextNode("");
  }

  return handler(vNode);
}
