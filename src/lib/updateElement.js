import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

export function updateAttributes(target, originNewProps, originOldProps) {
  if (!originNewProps && !originOldProps) return;

  if (originOldProps) {
    Object.keys(originOldProps).forEach((key) => {
      if (key === "children") return;

      if (key.startsWith("on")) {
        const eventType = key.substring(2).toLowerCase();
        removeEvent(target, eventType, originOldProps[key]);
      } else if (!originNewProps || !(key in originNewProps)) {
        if (key === "className") {
          target.removeAttribute("class");
        } else if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
          target[key] = false;
          target.removeAttribute(key);
        } else {
          target.removeAttribute(key);
        }
      }
    });
  }

  if (originNewProps) {
    Object.entries(originNewProps).forEach(([key, value]) => {
      if (key === "children") return;

      if (key === "className") {
        if (value) {
          target.setAttribute("class", value);
        } else {
          target.removeAttribute("class");
        }
        return;
      }

      if (key.startsWith("on")) {
        const eventType = key.substring(2).toLowerCase();
        addEvent(target, eventType, value);
        return;
      }

      if (typeof value === "boolean") {
        target[key] = value;
        return;
      }

      if (value != null && (!originOldProps || originOldProps[key] !== value)) {
        target.setAttribute(key, String(value));
      }
    });
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (!newNode && oldNode) {
    if (parentElement.childNodes[index]) {
      parentElement.removeChild(parentElement.childNodes[index]);
    }
    return;
  }

  if (newNode && !oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  if (typeof newNode === "string" || typeof newNode === "number") {
    if (newNode !== oldNode) {
      const newTextNode = document.createTextNode(String(newNode));
      if (parentElement.childNodes[index]) {
        parentElement.replaceChild(newTextNode, parentElement.childNodes[index]);
      } else {
        parentElement.appendChild(newTextNode);
      }
    }
    return;
  }

  if (newNode.type !== oldNode.type) {
    if (parentElement.childNodes[index]) {
      parentElement.replaceChild(createElement(newNode), parentElement.childNodes[index]);
    } else {
      parentElement.appendChild(createElement(newNode));
    }
    return;
  }

  const childNode = parentElement.childNodes[index];
  if (childNode) {
    updateAttributes(childNode, newNode.props || {}, oldNode.props || {});

    const newChildren = newNode.children || [];
    const oldChildren = oldNode.children || [];
    const maxLength = Math.max(newChildren.length, oldChildren.length);

    for (let i = 0; i < maxLength; i++) {
      updateElement(childNode, newChildren[i], oldChildren[i], i);
    }

    if (oldChildren.length > newChildren.length) {
      for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
        const extraChild = childNode.childNodes[i];
        if (extraChild) {
          childNode.removeChild(extraChild);
        }
      }
    }
  }
}
