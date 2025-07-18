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

  // 현재 엘리먼트 캐싱 (childNodes 접근 최소화)
  const currentElement = parentElement.childNodes[index];
  if (!currentElement) return;

  // 속성 업데이트
  updateAttributes(currentElement, newNode.props, oldNode.props);

  // 자식 노드 처리: 업데이트, 추가, 삭제를 분리하여 처리
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const commonLength = Math.min(newChildren.length, oldChildren.length);

  // 1. 공통 인덱스 업데이트
  for (let i = 0; i < commonLength; i++) {
    updateElement(currentElement, newChildren[i], oldChildren[i], i);
  }

  // 2. 추가 (newChildren가 더 많을 때)
  for (let i = oldChildren.length; i < newChildren.length; i++) {
    updateElement(currentElement, newChildren[i], null, i);
  }

  // 3. 삭제 (oldChildren가 더 많을 때, 반드시 역순으로!)
  for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
    const childNode = currentElement.childNodes[i];
    if (childNode) {
      currentElement.removeChild(childNode);
    }
  }
}
