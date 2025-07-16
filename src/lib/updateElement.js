import { createElement } from "./createElement.js";
import { addEvent, removeEvent } from "./eventManager";

/**
 * DOM Element의 속성을 비교하여 업데이트
 * @param {*} target DOM Element
 * @param {*} originNewProps 새로운 속성
 * @param {*} originOldProps 이전 속성
 */
function updateAttributes(target, originNewProps, originOldProps) {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  // 이전 속성 제거
  Object.keys(oldProps).forEach((key) => {
    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      removeEvent(target, eventType, oldProps[key]);
    }

    // 새로운 속성이 없으면 제거
    if (!newProps || !(key in newProps)) {
      if (key === "className") {
        target.removeAttribute("class");
      } else if (
        ["style", "checked", "disabled", "selected", "readOnly"].includes(key)
      ) {
        target[key] = false;
        target.removeAttribute(key);
      } else {
        target.removeAttribute(key);
      }
    }
  });

  if (!newProps) return;

  // 새로운 속성 추가/업데이트
  Object.entries(newProps).forEach(([key, value]) => {
    if (key === "children") return;

    if (key === "className") {
      if (value) {
        target.setAttribute("class", value);
      } else {
        target.removeAttribute("class");
      }
      return;
    }

    if (key === "style") {
      if (value) {
        target.style = value;
      } else {
        target.removeAttribute("style");
      }
    }

    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      addEvent(target, eventType, value);
      return;
    }

    if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
      target[key] = value;
      return;
    }

    // 속성이 변경되었을 때만 업데이트
    if (value != null && (!oldProps || oldProps[key] !== value)) {
      target.setAttribute(key, value.toString());
    }
  });
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 제거된 경우
  if (!newNode && oldNode) {
    if (parentElement.childNodes[index]) {
      parentElement.removeChild(parentElement.childNodes[index]);
    }
    return;
  }

  // 추가된 경우
  if (newNode && !oldNode) {
    const newElement = createElement(newNode);
    parentElement.appendChild(newElement);
    return;
  }

  // 둘 다 텍스트/문자열인 경우
  if (typeof newNode === "string" || typeof oldNode === "number") {
    if (newNode !== oldNode) {
      parentElement.childNodes[index].textContent = newNode;
    } else {
      parentElement.childNodes[index].textContent = newNode;
    }
    return;
  }

  // 타입이 변경된 경우 교체한다.
  if (newNode.type !== oldNode.type) {
    const newElement = createElement(newNode);
    const childNode = parentElement.childNodes[index];

    if (childNode) {
      parentElement.replaceChild(newElement, childNode);
    } else {
      parentElement.appendChild(newElement);
    }
    return;
  }

  // 타입이 같을 때 속성과 자식을 업데이트한다.
  const currentElement = parentElement.childNodes[index];
  updateAttributes(currentElement, newNode.props, oldNode.props);

  // 자식 업데이트
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];

  // 1단계: 공통 부분 재귀 업데이트 (기존 DOM 재사용)
  const commonLength = Math.min(newChildren.length, oldChildren.length);
  for (let i = 0; i < commonLength; i++) {
    updateElement(currentElement, newChildren[i], oldChildren[i], i);
  }

  // 2단계: 새 자식이 더 많으면 추가
  for (let i = commonLength; i < newChildren.length; i++) {
    updateElement(currentElement, newChildren[i], null, i);
  }

  // 3단계: 기존 자식이 더 많으면 제거 (뒤에서부터)
  for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
    updateElement(currentElement, null, oldChildren[i], i);
  }
}
