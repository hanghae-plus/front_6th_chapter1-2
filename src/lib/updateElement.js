import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement";

function updateAttributes(target, newProps, oldProps = {}) {
  const allEventKeys = new Set(
    [...Object.keys(oldProps), ...Object.keys(newProps)].filter((key) => key.startsWith("on")),
  );

  for (const key of allEventKeys) {
    const oldValue = oldProps[key];
    const newValue = newProps[key];
    const eventType = key.toLowerCase().substring(2);
    const isOldHandler = typeof oldValue === "function";
    const isNewHandler = typeof newValue === "function";

    if (isOldHandler && (!isNewHandler || oldValue !== newValue)) {
      removeEvent(target, eventType, oldValue);
    }
    if (isNewHandler && (!isOldHandler || oldValue !== newValue)) {
      addEvent(target, eventType, newValue);
    }
  }

  for (const key in oldProps) {
    if (key.startsWith("on")) continue;

    if (!(key in newProps) || newProps[key] === undefined || newProps[key] === null) {
      switch (key) {
        case "className":
          target.removeAttribute("class");
          break;
        case "style":
          target.removeAttribute("style");
          break;
        case "checked":
        case "disabled":
        case "selected":
          target.removeAttribute(key);
          target[key] = false;
          break;
        case "value":
          target.value = "";
          target.removeAttribute(key);
          break;
        default:
          target.removeAttribute(key);
          break;
      }
    }
  }

  for (const key in newProps) {
    if (key.startsWith("on")) continue;

    const oldValue = oldProps[key];
    const newValue = newProps[key];

    if (newValue === oldValue) continue;

    switch (key) {
      case "className":
        target.setAttribute("class", String(newValue));
        break;

      case "style":
        if (typeof newValue === "object" && newValue !== null) {
          if (typeof oldValue === "object" && oldValue !== null) {
            for (const oldStyleKey in oldValue) {
              if (!(oldStyleKey in newValue)) target.style[oldStyleKey] = "";
            }
          } else {
            target.removeAttribute("style");
          }
          for (const styleKey in newValue) {
            target.style[styleKey] = newValue[styleKey];
          }
        } else {
          target.removeAttribute("style");
        }
        break;

      case "checked":
        target.checked = !!newValue;
        if (!newValue) {
          target.removeAttribute(key);
        }
        break;

      case "disabled":
      case "selected":
        target[key] = !!newValue;
        if (newValue) {
          target.setAttribute(key, "");
        } else {
          target.removeAttribute(key);
        }
        break;

      case "value":
        target.value = newValue === undefined || newValue === null ? "" : newValue;
        target.removeAttribute("value");
        break;

      default:
        if (newValue !== undefined && newValue !== null) {
          target.setAttribute(key, String(newValue));
        } else {
          target.removeAttribute(key);
        }
        break;
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const target = parentElement.childNodes[index];

  // newNode만 있는 경우
  if (oldNode == null) {
    const newElement = createElement(newNode);
    if (newElement) {
      parentElement.insertBefore(newElement, target);
    }
    return newElement;
  }

  // oldNode만 있는 경우
  if (newNode == null) {
    if (target) {
      parentElement.removeChild(target);
    }
    return null;
  }

  // 둘 다 존재하는 경우
  const oldNodeType = typeof oldNode === "object" && oldNode !== null ? oldNode.type : typeof oldNode;
  const newNodeType = typeof newNode === "object" && newNode !== null ? newNode.type : typeof newNode;

  // - 타입이 다를 경우 교체
  if (oldNodeType !== newNodeType) {
    const newElement = createElement(newNode);
    if (target) {
      parentElement.replaceChild(newElement, target);
    } else if (newElement) {
      parentElement.appendChild(newElement);
    }
    return newElement;
  }

  // - 타입이 같을 경우 업데이트
  switch (typeof newNode) {
    case "string":
    case "number":
      if (target && target.nodeValue !== String(newNode)) {
        target.nodeValue = String(newNode);
      }
      return target;
    case "object":
      if (typeof newNode.type === "string") {
        if (!target || !(target instanceof HTMLElement)) {
          const newElement = createElement(newNode);
          if (target) {
            parentElement.replaceChild(newElement, target);
          } else {
            parentElement.appendChild(newElement);
          }
          return newElement;
        }

        updateAttributes(target, newNode.props || {}, oldNode.props || {});

        const oldChildren = oldNode.children || [];
        const newChildren = newNode.children || [];

        const maxChildrenLength = Math.max(oldChildren.length, newChildren.length);
        for (let i = 0; i < maxChildrenLength; i++) {
          updateElement(target, newChildren[i], oldChildren[i], i);
        }

        while (target.childNodes.length > newChildren.length) {
          if (target.lastChild) {
            target.removeChild(target.lastChild);
          }
        }
        return target;
      }
  }
  return target;
}
