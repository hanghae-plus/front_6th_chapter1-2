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
  removeChildren(currentDomNode, newNode, oldNode);
  updateChildren(currentDomNode, newNode, oldNode);
}

function updateProps(target, newNode, oldNode) {
  const newProps = newNode.props ?? {};
  const oldProps = oldNode.props ?? {};
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

function removeChildren(parent, newNode, oldNode) {
  const newChildrenLength = newNode.children.length;
  const oldChildrenLength = oldNode.children.length;

  if (newChildrenLength >= oldChildrenLength) {
    return;
  }

  const count = oldChildrenLength - newChildrenLength;
  for (let i = 0; i < count; i++) {
    parent.removeChild(parent.childNodes[newChildrenLength]);
  }
}

function updateChildren(parent, newNode, oldNode) {
  for (let i = 0; i < newNode.children.length; i++) {
    const newChild = newNode.children[i];
    const oldChild = oldNode.children[i];
    updateElement(parent, newChild, oldChild, i);
  }
}
