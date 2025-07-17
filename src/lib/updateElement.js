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
    if (newProps[key] !== undefined) return;

    if (key.startsWith("on") && typeof oldVal === "function") {
      const evt = key.slice(2).toLowerCase();
      removeEvent($el, evt, oldVal);
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
      const evt = key.slice(2).toLowerCase();
      if (typeof oldVal === "function") removeEvent($el, evt, oldVal);
      addEvent($el, evt, newVal);
      return;
    }

    if (key === "className") {
      if (!newVal) {
        $el.removeAttribute("class");
      } else {
        $el.setAttribute("class", newVal);
      }
      return;
    }

    if (typeof newVal === "boolean") {
      $el[key] = newVal;
      const propOnly = ["checked", "selected"];
      if (propOnly.includes(key)) {
        if ($el.hasAttribute(key)) $el.removeAttribute(key);
      } else {
        if (newVal) {
          $el.setAttribute(key, "");
        } else {
          $el.removeAttribute(key);
        }
      }
      return;
    }

    $el.setAttribute(key, newVal);
  });
}

function getKey(child, index) {
  if (child && typeof child === "object" && child.props && child.props.key !== undefined) {
    return child.props.key;
  }
  return index;
}

export function updateElement(parentEl, newVNode, oldVNode, index = 0) {
  const existingDom = parentEl.childNodes[index];

  if (oldVNode === undefined) {
    const newDom = createElement(newVNode);
    if (existingDom) parentEl.insertBefore(newDom, existingDom);
    else parentEl.appendChild(newDom);
    return;
  }

  if (newVNode === undefined) {
    if (existingDom) parentEl.removeChild(existingDom);
    return;
  }

  if (isTextish(newVNode) && isTextish(oldVNode)) {
    const newText = newVNode == null || typeof newVNode === "boolean" ? "" : newVNode.toString();
    const oldText = oldVNode == null || typeof oldVNode === "boolean" ? "" : oldVNode.toString();
    if (newText !== oldText) {
      existingDom.textContent = newText;
    }
    return;
  }

  const newIsObj = typeof newVNode === "object" && newVNode !== null;
  const oldIsObj = typeof oldVNode === "object" && oldVNode !== null;

  if (!newIsObj || !oldIsObj || newVNode.type !== oldVNode.type) {
    const newDom = createElement(newVNode);
    parentEl.replaceChild(newDom, existingDom);
    return;
  }

  updateAttributes(existingDom, newVNode.props || {}, oldVNode.props || {});

  const newChildren = newVNode.children || [];
  const oldChildren = oldVNode.children || [];

  const oldKeyMap = new Map();
  oldChildren.forEach((child, idx) => {
    oldKeyMap.set(getKey(child, idx), { vnode: child, dom: existingDom.childNodes[idx] });
  });

  let nextDomIdx = 0;
  const processedKeys = new Set();

  newChildren.forEach((child, newIdx) => {
    const key = getKey(child, newIdx);
    processedKeys.add(key);
    const match = oldKeyMap.get(key);

    if (match) {
      const desiredPosDom = existingDom.childNodes[nextDomIdx];
      if (match.dom !== desiredPosDom) {
        existingDom.insertBefore(match.dom, desiredPosDom || null);
      }
      updateElement(existingDom, child, match.vnode, nextDomIdx);
    } else {
      updateElement(existingDom, child, undefined, nextDomIdx);
    }
    nextDomIdx += 1;
  });

  oldChildren.forEach((child, idx) => {
    const key = getKey(child, idx);
    if (!processedKeys.has(key)) {
      const info = oldKeyMap.get(key);
      if (info && info.dom.parentNode === existingDom) {
        existingDom.removeChild(info.dom);
      }
    }
  });
}
