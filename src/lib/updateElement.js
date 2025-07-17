import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement";

function isTextish(value) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    value === null ||
    value === undefined ||
    typeof value === "boolean"
  );
}

function updateAttributes($el, newProps = {}, oldProps = {}) {
  Object.entries(oldProps).forEach(([key, oldVal]) => {
    if (key === "key") return;
    const newVal = newProps[key];
    if (newVal !== undefined) return;

    if (key.startsWith("on") && typeof oldVal === "function") {
      const eventType = key.slice(2).toLowerCase();
      removeEvent($el, eventType, oldVal);
      return;
    }

    if (key === "className") {
      $el.removeAttribute("class");
      return;
    }

    if (typeof oldVal === "boolean") {
      $el[key] = false;
      $el.removeAttribute(key);
      return;
    }

    $el.removeAttribute(key);
  });

  Object.entries(newProps).forEach(([key, newVal]) => {
    if (key === "key") return;
    const oldVal = oldProps[key];
    if (oldVal === newVal) return;

    if (key.startsWith("on") && typeof newVal === "function") {
      const eventType = key.slice(2).toLowerCase();
      if (typeof oldVal === "function") {
        removeEvent($el, eventType, oldVal);
      }
      addEvent($el, eventType, newVal);
      return;
    }

    if (key === "className") {
      if (newVal == null || newVal === "") {
        $el.removeAttribute("class");
      } else {
        $el.setAttribute("class", newVal);
      }
      return;
    }

    if (typeof newVal === "boolean") {
      $el[key] = newVal;

      const propsWithoutAttr = ["checked", "selected"];
      if (propsWithoutAttr.includes(key)) {
        if (newVal) {
          $el.removeAttribute(key);
        } else {
          $el.removeAttribute(key);
        }
        return;
      }

      if (newVal) {
        $el.setAttribute(key, "");
      } else {
        $el.removeAttribute(key);
      }
      return;
    }

    $el.setAttribute(key, newVal);
  });
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const existingElement = parentElement.childNodes[index];

  if (oldNode === undefined) {
    const newEl = createElement(newNode);
    if (existingElement) {
      parentElement.insertBefore(newEl, existingElement);
    } else {
      parentElement.appendChild(newEl);
    }
    return;
  }

  if (newNode === undefined) {
    if (existingElement) {
      parentElement.removeChild(existingElement);
    }
    return;
  }

  if (isTextish(newNode) && isTextish(oldNode)) {
    const newText = newNode == null || typeof newNode === "boolean" ? "" : newNode.toString();
    const oldText = oldNode == null || typeof oldNode === "boolean" ? "" : oldNode.toString();
    if (newText !== oldText) {
      if (existingElement) existingElement.textContent = newText;
    }
    return;
  }

  const newIsObj = typeof newNode === "object" && newNode !== null;
  const oldIsObj = typeof oldNode === "object" && oldNode !== null;

  if (!newIsObj || !oldIsObj || newNode.type !== oldNode.type) {
    const newEl = createElement(newNode);
    if (existingElement) {
      parentElement.replaceChild(newEl, existingElement);
    } else {
      parentElement.appendChild(newEl);
    }
    return;
  }

  updateAttributes(existingElement, newNode.props || {}, oldNode.props || {});

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLen = Math.max(newChildren.length, oldChildren.length);
  for (let i = maxLen - 1; i >= 0; i--) {
    updateElement(existingElement, newChildren[i], oldChildren[i], i);
  }
}
