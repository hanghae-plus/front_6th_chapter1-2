import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

export function updateAttributes(element, newProps, oldProps = null) {
  if (!newProps && !oldProps) return;

  for (const key in oldProps ?? {}) {
    if (key === "children") continue;

    if (key.startsWith("on")) {
      const eventType = key.substring(2).toLowerCase();
      removeEvent(element, eventType, oldProps[key]);
    } else if (!newProps || !(key in newProps)) {
      if (key === "className") {
        element.removeAttribute("class");
      } else if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
        element[key] = false;
        element.removeAttribute(key);
      } else {
        element.removeAttribute(key);
      }
    }
  }
  for (const key in newProps ?? {}) {
    const value = newProps[key];

    if (key === "children") continue;

    if (key === "className") {
      if (value) {
        element.setAttribute("class", value);
      } else {
        element.removeAttribute("class");
      }
      continue;
    }

    if (key.startsWith("on")) {
      const eventType = key.substring(2).toLowerCase();
      addEvent(element, eventType, value);
      continue;
    }

    if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
      element[key] = Boolean(value);
      continue;
    }

    if (value != null && (!oldProps || oldProps[key] !== value)) {
      element.setAttribute(key, String(value));
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const target = parentElement.childNodes[index];

  // 1. 노드 제거 (newNode가 없고 oldNode가 있는 경우)
  if (newNode == null && oldNode != null) {
    const oldProps = oldNode.props;
    if (target) {
      for (const key in oldProps) {
        if (key.startsWith("on") && typeof oldProps[key] === "function") {
          removeEvent(target, key.slice(2).toLowerCase(), oldProps[key]);
        }
      }

      parentElement.removeChild(target);
    }
    return;
  }

  // 2. 새 노드 추가 (newNode가 있고 oldNode가 없는 경우)
  if (newNode != null && oldNode == null) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  // 3. 텍스트 노드 업데이트
  const newEl = createElement(newNode);
  const oldEl = createElement(oldNode);
  if (newNode != null && oldNode != null && newEl.nodeType === Node.TEXT_NODE && oldEl.nodeType === Node.TEXT_NODE) {
    if (newNode !== oldNode) {
      const newTextNode = document.createTextNode(String(newNode));
      if (target) {
        parentElement.replaceChild(newTextNode, target);
      } else {
        parentElement.appendChild(newTextNode);
      }
    }
    return;
  }

  // 4. 노드 교체 (newNode와 oldNode의 타입이 다른 경우)
  if (newNode != null && oldNode != null && newNode.type !== oldNode.type) {
    const $el = parentElement.children[0];
    for (const key in oldNode.props) {
      const value = oldNode.props[key];
      if (key.startsWith("on") && typeof value === "function") {
        removeEvent($el, key.slice(2).toLowerCase(), value);
      }
    }

    if (target) {
      parentElement.replaceChild(newEl, target);
    } else {
      parentElement.appendChild(newEl);
    }
    return;
  }

  // 5. 같은 타입의 노드 업데이트
  //     - 속성 업데이트
  //     - 자식 노드 재귀적 업데이트
  //     - 불필요한 자식 노드 제거
  if (target) {
    const oldProps = oldNode.props;
    const newProps = newNode.props;
    updateAttributes(target, newProps ?? {}, oldProps ?? {});

    const oldChildren = oldNode.children ?? [];
    const newChildren = newNode.children ?? [];
    for (let i = 0; i < Math.max(newChildren.length, oldChildren.length); i++) {
      updateElement(target, newChildren[i], oldChildren[i], i);
    }

    if (oldChildren.length > newChildren.length) {
      for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
        if (target.childNodes[i]) {
          target.removeChild(target.childNodes[i]);
        }
      }
    }
  }

  return;
}
