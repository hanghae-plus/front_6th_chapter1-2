import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement";

function updateAttributes(target, originNewProps, originOldProps) {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  Object.keys(oldProps).forEach((key) => {
    if (!(key in newProps)) {
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase();
        removeEvent(target, eventType, oldProps[key]);
        return;
      }

      if (key === "className") {
        target.removeAttribute("class");
        return;
      }

      if (key === "children") {
        return;
      }

      if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
        target[key] = false;
        const attrName = key === "readOnly" ? "readonly" : key;
        target.removeAttribute(attrName);
        return;
      }

      if (key === "style") {
        Object.assign(target.style, {});
        return;
      }

      target.removeAttribute(key);
    }
  });

  Object.keys(newProps).forEach((key) => {
    if (newProps[key] !== oldProps[key]) {
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase();
        if (oldProps[key]) {
          removeEvent(target, eventType, oldProps[key]);
        }
        addEvent(target, eventType, newProps[key]);
        return;
      }

      if (key === "style" && typeof newProps[key] === "object") {
        Object.assign(target.style, newProps[key]);
        return;
      }

      if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
        const attrName = key === "readOnly" ? "readonly" : key;
        if (newProps[key] === true) {
          target[key] = true;
          if (key === "disabled" || key === "readOnly") {
            target.setAttribute(attrName, "");
          } else {
            target.removeAttribute(attrName);
          }
        } else {
          target[key] = false;
          target.removeAttribute(attrName);
        }
        return;
      }

      if (key === "className") {
        target.setAttribute("class", newProps[key]);
        return;
      }

      if (newProps[key] === null || newProps[key] === undefined) {
        target.removeAttribute(key);
        return;
      }

      target.setAttribute(key, newProps[key]);
    }
  });
}

/**
 *
 * @param {*} parentElement
 * @param {*} newNode
 * @param {*} oldNode
 * @param {*} index
 * @returns
 */
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (!newNode && oldNode) {
    const oldElement = parentElement.childNodes[index];
    if (oldElement) {
      parentElement.removeChild(oldElement);
    }
    return;
  }

  if (!oldNode && newNode) {
    const newElement = createElement(newNode);
    parentElement.appendChild(newElement);
    return;
  }

  if (typeof newNode === "string" || typeof newNode === "number") {
    if (oldNode !== newNode) {
      const newTextNode = document.createTextNode(String(newNode));
      const currentNode = parentElement.childNodes[index];

      if (currentNode) {
        parentElement.replaceChild(newTextNode, currentNode);
      } else {
        parentElement.appendChild(newTextNode);
      }
    }
    return;
  }

  if (newNode.type !== oldNode.type) {
    const newElement = createElement(newNode);
    const oldElement = parentElement.childNodes[index];
    if (oldElement) {
      parentElement.replaceChild(newElement, oldElement);
    }
    return;
  }

  const currentElement = parentElement.childNodes[index];
  if (!currentElement) return;

  updateAttributes(currentElement, newNode.props, oldNode.props);

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];

  for (let i = 0; i < Math.min(newChildren.length, oldChildren.length); i++) {
    updateElement(currentElement, newChildren[i], oldChildren[i], i);
  }

  for (let i = oldChildren.length; i < newChildren.length; i++) {
    updateElement(currentElement, newChildren[i], null, i);
  }

  const childrenToRemove = oldChildren.length - newChildren.length;

  for (let i = 0; i < childrenToRemove; i++) {
    const lastChild = currentElement.lastChild;
    if (lastChild) {
      currentElement.removeChild(lastChild);
    }
  }
}
