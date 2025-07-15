import { addEvent, removeEvent } from "./eventManager.js";
import { createElement } from "./createElement.js";

const BOOLEAN_PROPS = ["checked", "disabled", "selected", "readOnly"];

function getProps(target) {
  const props = {};

  for (const attr of target.getAttributeNames()) {
    if (attr === "class") {
      props.className = target.getAttribute("class");
    } else {
      props[attr] = target.getAttribute(attr);
    }
  }

  for (const key of BOOLEAN_PROPS) {
    if (key in target) props[key] = target[key];
  }

  return props;
}

function getEventName(fullname) {
  return fullname.slice(2).toLowerCase();
}

function updateAttributes(target, originNewProps, originOldProps) {
  const newKeys = new Set(Object.keys(originNewProps));
  const oldKeys = new Set(Object.keys(originOldProps));
  const removedKeys = new Set([...oldKeys].filter((key) => !newKeys.has(key)));
  const addedKeys = new Set([...newKeys].filter((key) => !oldKeys.has(key)));
  const updatedKeys = new Set([...newKeys].filter((key) => oldKeys.has(key)));

  for (const key of removedKeys) {
    if (key.startsWith("on") && typeof originOldProps[key] === "function") {
      removeEvent(target, getEventName(key), originOldProps[key]);
      continue;
    }

    if (key === "className") {
      target.removeAttribute("class");
      continue;
    }

    if (BOOLEAN_PROPS.includes(key)) {
      target[key] = false;
    }

    target.removeAttribute(key);
  }

  for (const key of addedKeys) {
    if (key.startsWith("on") && typeof originOldProps[key] === "function") {
      addEvent(target, getEventName(key), originNewProps[key]);
      continue;
    }

    if (key === "className") {
      if (originNewProps[key]) {
        target.setAttribute("class", originNewProps[key]);
      } else {
        target.removeAttribute("class");
      }
      continue;
    }

    if (BOOLEAN_PROPS.includes(key)) {
      if (key === "disabled") {
        target[key] = !!originNewProps[key];
        if (originNewProps[key]) {
          target.setAttribute(key, "");
          continue;
        }
      } else if (key === "checked" || key === "selected") {
        target[key] = !!originNewProps[key];
      }
      target.removeAttribute(key);
      continue;
    }

    target.setAttribute(key, originNewProps[key]);
  }

  for (const key of updatedKeys) {
    if (key.startsWith("on") && originOldProps[key] !== originNewProps[key]) {
      if (typeof originOldProps[key] === "function") {
        removeEvent(target, getEventName(key), originOldProps[key]);
      }
      if (typeof originNewProps[key] === "function") {
        addEvent(target, getEventName(key), originNewProps[key]);
      }
      continue;
    }

    if (key === "className") {
      if (originNewProps[key]) {
        target.setAttribute("class", originNewProps[key]);
      } else {
        target.removeAttribute("class");
      }
      continue;
    }

    if (BOOLEAN_PROPS.includes(key)) {
      if (key === "disabled" || key === "readOnly") {
        target[key] = !!originNewProps[key];
        if (originNewProps[key]) {
          target.setAttribute(key, "");
          continue;
        }
      } else if (key === "checked" || key === "selected") {
        target[key] = !!originNewProps[key];
      }
      target.removeAttribute(key);
      continue;
    }

    target.setAttribute(key, originNewProps[key]);
  }
}

export function updateElement(parentElement, newVNode, domElement, previousVNode = null) {
  if (!domElement) {
    parentElement.appendChild(createElement(newVNode));
    return;
  }

  if (!newVNode) {
    parentElement.removeChild(domElement);
    return;
  }

  if (typeof newVNode === "string" || typeof newVNode === "number") {
    if (domElement.nodeType !== Node.TEXT_NODE) {
      parentElement.replaceChild(document.createTextNode(newVNode), domElement);
    } else if (domElement.textContent !== String(newVNode)) {
      domElement.textContent = newVNode;
    }
    return;
  }

  if (domElement.nodeType === Node.TEXT_NODE) {
    parentElement.replaceChild(createElement(newVNode), domElement);
    return;
  }

  if (newVNode.type !== domElement.nodeName.toLowerCase()) {
    const oldProps = getProps(domElement);
    for (const key of Object.keys(oldProps)) {
      if (key.startsWith("on") && typeof oldProps[key] === "function") {
        removeEvent(domElement, getEventName(key), oldProps[key]);
      }
    }

    parentElement.replaceChild(createElement(newVNode), domElement);
    return;
  }

  const oldProps = previousVNode?.props ?? getProps(domElement);
  updateAttributes(domElement, newVNode.props ?? {}, oldProps);

  const newChildren = newVNode.children ?? [];
  const oldChildNodes = Array.from(domElement.childNodes);

  for (let i = 0; i < Math.max(newChildren.length, oldChildNodes.length); i++) {
    const previousChildVNode = previousVNode?.children?.[i] ?? null;

    updateElement(domElement, newChildren[i], domElement.childNodes[i], previousChildVNode, i);
  }

  while (domElement.childNodes.length > newChildren.length) {
    const oldChildDom = domElement.childNodes[newChildren.length];

    if (oldChildDom) {
      const oldChildProps = getProps(oldChildDom);
      for (const key of Object.keys(oldChildProps)) {
        if (key.startsWith("on") && typeof oldChildProps[key] === "function") {
          removeEvent(oldChildDom, getEventName(key), oldChildProps[key]);
        }
      }
    }

    domElement.removeChild(domElement.lastChild);
  }
}
