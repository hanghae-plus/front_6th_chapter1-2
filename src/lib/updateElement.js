import { isNullish, isString } from "../utils/typeCheck";
import { removeAttribute, updateAttribute } from "../utils/updateAttribute";
import { createElement } from "./createElement";

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const currentDomNode = parentElement.childNodes[index];

  if (newNode && isNullish(oldNode)) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  if (isNullish(newNode) && oldNode) {
    parentElement.removeChild(currentDomNode);
    return;
  }

  if (isString(newNode) && isString(oldNode)) {
    if (newNode !== oldNode) {
      currentDomNode.nodeValue = newNode;
    }
    return;
  }

  if (newNode.type !== oldNode.type) {
    parentElement.replaceChild(createElement(newNode), currentDomNode);
    return;
  }

  updateProps(currentDomNode, newNode, oldNode);

  let i = 0;
  let maxChildrenLength = Math.max(newNode.children.length, oldNode.children.length);
  while (i < maxChildrenLength) {
    const newChild = newNode.children[i];
    const oldChild = oldNode.children[i];
    if (!newChild && oldChild) {
      updateElement(currentDomNode, null, oldChild, i);
      maxChildrenLength -= 1;
    } else {
      updateElement(currentDomNode, newChild, oldChild, i);
      i += 1;
    }
  }
}

function updateProps(target, newNode, oldNode) {
  const { props: newProps = {} } = newNode;
  const { props: oldProps = {} } = oldNode;
  const newPropsKeys = Object.keys(newProps);
  const oldPropsKeys = Object.keys(oldProps);
  const allKeys = new Set([...newPropsKeys, ...oldPropsKeys]);

  for (const key of allKeys) {
    if (!(key in newProps)) {
      removeAttribute(target, key, oldProps[key]);
      continue;
    }

    if (newProps[key] !== oldProps[key]) {
      updateAttribute(target, key, newProps[key]);
    }
  }
}
