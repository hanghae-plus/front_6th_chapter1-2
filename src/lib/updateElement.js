import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";
import { isNil } from "../utils/isNil.js";
import { difference } from "../utils/set.js";

const BOOLEAN_ATTRIBUTES = [
  "autoFocus",
  "autoPlay",
  "async",
  "checked",
  "controls",
  "defer",
  "disabled",
  "hidden",
  "loop",
  "multiple",
  "muted",
  "open",
  "readOnly",
  "required",
  "reversed",
  "selected",
  "autoComplete",
  "capture",
  "defaultChecked",
  "defaultSelected",
  "itemScope",
  "noValidate",
];

// 동기적 DOM Batcher
class SyncDOMBatcher {
  constructor() {
    this.operations = [];
  }

  schedule(operation) {
    this.operations.push(operation);
  }

  flushSync() {
    this.operations.forEach((op) => {
      switch (op.type) {
        case "appendChild":
          op.parent.appendChild(op.element);
          break;
        case "removeChild":
          op.parent.removeChild(op.element);
          break;
        case "replaceChild":
          op.parent.replaceChild(op.newElement, op.oldElement);
          break;
        case "replaceElement":
          this.replaceWithEventPreservation(op.existingElement, op.newElement);
          break;
        case "textContent":
          op.element.textContent = op.value;
          break;
      }
    });
    this.operations = [];
  }

  replaceWithEventPreservation(existingElement, newElement) {
    existingElement.parentNode.replaceChild(newElement, existingElement);
  }
}

function appendAttributes($el, props) {
  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith("on")) {
        if (typeof value !== "function") {
          throw new Error(`Event handler must be a function: ${key}`);
        }
        addEvent($el, key.substring(2).toLowerCase(), value);
      } else if (BOOLEAN_ATTRIBUTES.includes(key)) {
        $el[key] = Boolean(value);
      } else {
        $el.setAttribute(normalizeAttributeKey(key), value);
      }
    });
  }
}

const normalizeAttributeKey = (key) => {
  switch (key) {
    case "className":
      return "class";
    case "htmlFor":
      return "for";
    default:
      return key.toLowerCase();
  }
};

function updateAttributes(target, originNewProps, originOldProps) {
  if (isNil(originOldProps)) {
    appendAttributes(target, originNewProps);
    return;
  }
  if (isNil(originNewProps)) {
    Object.keys(originOldProps).forEach((key) => {
      if (key.startsWith("on")) {
        removeEvent(target, key.substring(2).toLowerCase(), originOldProps[key]);
      } else if (BOOLEAN_ATTRIBUTES.includes(key)) {
        target[key] = false;
      } else {
        target.removeAttribute(normalizeAttributeKey(key));
      }
    });
    return;
  }

  const differenceAttributes = difference(new Set(Object.keys(originOldProps)), new Set(Object.keys(originNewProps)));
  differenceAttributes.forEach((key) => {
    if (key.startsWith("on")) {
      removeEvent(target, key.substring(2).toLowerCase(), originOldProps[key]);
    } else if (BOOLEAN_ATTRIBUTES.includes(key)) {
      target[key] = false;
    } else {
      target.removeAttribute(normalizeAttributeKey(key));
    }
  });
  Object.keys(originNewProps).forEach((key) => {
    if (originNewProps[key] !== originOldProps[key]) {
      if (key.startsWith("on")) {
        removeEvent(target, key.substring(2).toLowerCase(), originOldProps[key]);
        addEvent(target, key.substring(2).toLowerCase(), originNewProps[key]);
      } else if (BOOLEAN_ATTRIBUTES.includes(key)) {
        target[key] = Boolean(originNewProps[key]);
      } else {
        if (!originNewProps[key]) {
          target.removeAttribute(normalizeAttributeKey(key));
        } else {
          target.setAttribute(normalizeAttributeKey(key), originNewProps[key]);
        }
      }
    }
    return;
  });
  Object.keys(originOldProps).forEach((key) => {
    if (key.startsWith("on") && !(key in originNewProps)) {
      removeEvent(target, key.substring(2).toLowerCase(), originOldProps[key]);
    }
    return;
  });
}

export function updateElement(parentElement, newNode, oldNode, index = 0, batcher = null) {
  const isRootCall = !batcher;
  if (isRootCall) {
    batcher = new SyncDOMBatcher();
  }

  updateElementBatched(parentElement, newNode, oldNode, index, batcher);

  if (isRootCall) {
    batcher.flushSync();
  }
}

function updateElementBatched(parentElement, newNode, oldNode, index = 0, batcher) {
  if (isNil(oldNode)) {
    const $el = createElement(newNode);
    batcher.schedule({ type: "appendChild", parent: parentElement, element: $el });
    return;
  }
  if (isNil(newNode)) {
    batcher.schedule({ type: "removeChild", parent: parentElement, element: parentElement.childNodes[index] });
    return;
  }
  if (typeof oldNode === "string" && typeof newNode === "string") {
    if (oldNode !== newNode) {
      batcher.schedule({ type: "textContent", element: parentElement.childNodes[index], value: newNode });
    }
    return;
  }
  if (newNode.type === oldNode?.type) {
    const currentElement = parentElement.childNodes[index];
    updateAttributes(currentElement, newNode.props, oldNode.props);
    const iteration = Math.max(newNode.children?.length || 0, oldNode.children?.length || 0);
    for (let i = 0; i < iteration; i++) {
      updateElement(currentElement, newNode.children?.at(i), oldNode.children?.at(i), i, batcher);
    }
  } else {
    const existingElement = parentElement.childNodes[index];
    const $newEl = createElement(newNode);

    batcher.schedule({
      type: "replaceElement",
      existingElement,
      newElement: $newEl,
      parent: parentElement,
      index,
    });
  }
}
