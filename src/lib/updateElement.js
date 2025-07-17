import { createElement } from "./createElement";
import { addEvent, removeEvent } from "./eventManager";

function setProp($el, key, value) {
  if (key === "children") return;

  if (key === "className") {
    if (value) {
      $el.className = value;
    } else {
      $el.removeAttribute("class");
    }
  } else if (key === "checked" || key === "selected") {
    $el[key] = !!value;
    $el.removeAttribute(key);
  } else if (key === "disabled" || key === "readOnly") {
    if (value) {
      $el.setAttribute(key, "");
      $el[key] = true;
    } else {
      $el.removeAttribute(key);
      $el[key] = false;
    }
  } else if (key === "value" && ($el.tagName === "INPUT" || $el.tagName === "TEXTAREA" || $el.tagName === "SELECT")) {
    // input, textarea, select의 value는 property로 설정
    $el.value = value;
  } else if (key.startsWith("on") && typeof value === "function") {
    const eventType = key.toLowerCase().substring(2);
    addEvent($el, eventType, value);
  } else if (value === false || value === null || value === undefined) {
    $el.removeAttribute(key);
  } else {
    $el.setAttribute(key, value);
  }
}

function updateAttributes($el, oldProps = {}, newProps = {}) {
  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

  allKeys.forEach((key) => {
    if (key === "children") return;

    const oldValue = oldProps[key];
    const newValue = newProps[key];

    if (oldValue !== newValue) {
      if (key.startsWith("on") && typeof oldValue === "function") {
        const eventType = key.toLowerCase().substring(2);
        removeEvent($el, eventType, oldValue);
      }
      setProp($el, key, newValue);
    }
  });
}

function updateChildren($parent, oldChildren = [], newChildren = []) {
  // 안전한 기본값 설정
  const safeOldChildren = Array.isArray(oldChildren) ? oldChildren : [];
  const safeNewChildren = Array.isArray(newChildren) ? newChildren : [];

  const oldLen = safeOldChildren.length;
  const newLen = safeNewChildren.length;
  const currentDomChildren = Array.from($parent.childNodes); // Make a static copy

  // Update existing children
  for (let i = 0; i < Math.min(oldLen, newLen); i++) {
    updateElement(currentDomChildren[i], safeOldChildren[i], safeNewChildren[i]);
  }

  // Add new children
  if (newLen > oldLen) {
    for (let i = oldLen; i < newLen; i++) {
      $parent.appendChild(createElement(safeNewChildren[i]));
    }
  }
  // Remove excess old children
  else if (oldLen > newLen) {
    // Iterate backwards to avoid issues with live NodeList
    for (let i = oldLen - 1; i >= newLen; i--) {
      if (currentDomChildren[i]) {
        // Ensure the node exists before removing
        $parent.removeChild(currentDomChildren[i]);
      }
    }
  }
}

export function updateElement($el, oldVNode, newVNode) {
  if (oldVNode === newVNode) return;

  if (typeof newVNode === "string" || typeof newVNode === "number") {
    if ($el.textContent !== String(newVNode)) {
      $el.textContent = String(newVNode);
    }
    return;
  }

  if (typeof oldVNode === "string" || typeof oldVNode === "number") {
    const newElement = createElement(newVNode);
    if (newElement) {
      $el.parentNode.replaceChild(newElement, $el);
    }
    return;
  }

  if (oldVNode.type !== newVNode.type) {
    const newElement = createElement(newVNode);
    if (newElement) {
      $el.parentNode.replaceChild(newElement, $el);
    }
    return;
  }

  updateAttributes($el, oldVNode?.props || {}, newVNode?.props || {});
  updateChildren($el, oldVNode?.children || [], newVNode?.children || []);
}
