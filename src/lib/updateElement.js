import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

const BOOLEAN_PROPS = ["checked", "disabled", "selected", "readOnly"];

function updateAttributes(target, newProps, oldProps) {
  const newKeys = new Set(Object.keys(newProps));
  const oldKeys = new Set(Object.keys(oldProps));
  const removedKeys = new Set([...oldKeys].filter((key) => !newKeys.has(key)));
  const addedKeys = new Set([...newKeys].filter((key) => !oldKeys.has(key)));
  const updatedKeys = new Set([...newKeys].filter((key) => oldKeys.has(key)));

  for (const key of removedKeys) {
    if (key.startsWith("on") && typeof oldProps[key] === "function") {
      removeEvent(target, key.slice(2).toLowerCase(), oldProps[key]);
      continue;
    }

    if (key === "className") {
      target.removeAttribute("class");
      continue;
    }

    target.removeAttribute(key);
  }

  for (const key of addedKeys) {
    if (key.startsWith("on") && typeof newProps[key] === "function") {
      addEvent(target, key.slice(2).toLowerCase(), newProps[key]);
      continue;
    }

    if (key === "className") {
      if (newProps[key] != null) {
        target.setAttribute("class", newProps[key]);
      } else {
        target.removeAttribute("class");
      }
      continue;
    }

    if (BOOLEAN_PROPS.includes(key)) {
      if (key === "disabled") {
        target[key] = !!newProps[key];
        if (newProps[key]) {
          target.setAttribute(key, "");
          continue;
        }
      } else if (key === "checked" || key === "selected") {
        target[key] = !!newProps[key];
      }
      target.removeAttribute(key);
      continue;
    }

    target.setAttribute(key, newProps[key]);
  }

  for (const key of updatedKeys) {
    if (key.startsWith("on") && oldProps[key] !== newProps[key]) {
      if (typeof oldProps[key] === "function") {
        removeEvent(target, key.slice(2).toLowerCase(), oldProps[key]);
      }
      if (typeof newProps[key] === "function") {
        addEvent(target, key.slice(2).toLowerCase(), newProps[key]);
      }
      continue;
    }

    if (key === "className") {
      if (newProps[key]) {
        target.setAttribute("class", newProps[key]);
      } else {
        target.removeAttribute("class");
      }
      continue;
    }

    if (BOOLEAN_PROPS.includes(key)) {
      if (key === "disabled" || key === "readOnly") {
        target[key] = !!newProps[key];
        if (newProps[key]) {
          target.setAttribute(key, "");
          continue;
        }
      } else if (key === "checked" || key === "selected") {
        target[key] = !!newProps[key];
      }
      target.removeAttribute(key);
      continue;
    }

    target.setAttribute(key, newProps[key]);
  }
}

export function updateElement(parentElement, newNode, oldNode) {
  if (newNode == null && oldNode == null) {
    return;
  }

  // 1. 노드 제거 (newNode가 없고 oldNode가 있는 경우)
  if (newNode == null && oldNode != null) {
    const oldProps = oldNode.props;
    for (const key in oldProps) {
      if (key.startsWith("on") && typeof oldProps[key] === "function") {
        removeEvent(parentElement.children[0], key.slice(2).toLowerCase(), oldProps[key]);
      }
    }

    parentElement.removeChild(parentElement.children[0]);
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
  console.log("텍스트 노드 업데이트", newEl.nodeType, oldEl.nodeType);
  console.log("parentElement.children[0].textContent", parentElement.innerHTML);
  console.log(oldNode, newNode);

  if (newNode != null && oldNode != null && newEl.nodeType === Node.TEXT_NODE && oldEl.nodeType === Node.TEXT_NODE) {
    parentElement.textContent = newEl.textContent;
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

    parentElement.replaceChild(createElement(newNode), parentElement.children[0]);
    return;
  }

  // 5. 같은 타입의 노드 업데이트
  //     - 속성 업데이트
  //     - 자식 노드 재귀적 업데이트
  //     - 불필요한 자식 노드 제거

  const oldProps = oldNode.props;
  const newProps = newNode.props;
  const $el = parentElement.children[0];
  updateAttributes($el, newProps ?? {}, oldProps ?? {});

  const oldChildren = oldNode.children ?? [];
  const newChildren = newNode.children ?? [];
  for (let i = 0; i < Math.max(newChildren.length, oldChildren.length); i++) {
    updateElement($el, newChildren[i], oldChildren[i]);
  }

  return;
}
