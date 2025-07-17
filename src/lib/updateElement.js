import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, originNewProps, originOldProps) {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  // 이전 속성 제거
  Object.keys(oldProps).forEach((key) => {
    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      if (oldProps[key]) {
        removeEvent(target, eventType, oldProps[key]);
      }
    } else if (!(key in newProps)) {
      if (key === "className") {
        target.className = "";
        target.removeAttribute("class");
      } else if (key === "checked" || key === "disabled" || key === "readOnly" || key === "selected") {
        target[key] = false;
        if (key === "disabled" || key === "readOnly") {
          target.removeAttribute(key.toLowerCase());
        }
      } else {
        target.removeAttribute(key);
      }
    }
  });

  // 새로운 속성 추가/업데이트
  Object.entries(newProps).forEach(([key, value]) => {
    if (oldProps[key] === value) return;

    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      if (oldProps[key]) {
        removeEvent(target, eventType, oldProps[key]);
      }
      addEvent(target, eventType, value);
    } else if (key === "className") {
      if (value) {
        target.className = value;
      } else {
        target.className = "";
        target.removeAttribute("class");
      }
    } else if (key === "checked" || key === "disabled" || key === "readOnly" || key === "selected") {
      target[key] = !!value;
      if (key === "disabled" || key === "readOnly") {
        if (value) {
          target.setAttribute(key.toLowerCase(), "");
        } else {
          target.removeAttribute(key.toLowerCase());
        }
      }
      // checked, selected는 attribute를 조작하지 않음
    } else {
      if (value === false || value === null || value === undefined) {
        target.removeAttribute(key);
      } else {
        target.setAttribute(key, value);
      }
    }
  });
}

export function updateElement(parentElement, currentVNode, prevVNode, index = 0) {
  // 1. oldNode만 있는 경우
  if (!currentVNode && prevVNode) return;

  // 2. newNode만 있는 경우
  if (!prevVNode && currentVNode) {
    parentElement.appendChild(createElement(currentVNode));
    return;
  }

  // 3. oldNode와 newNode 모두 text 타입일 경우
  if (typeof currentVNode === "string" && typeof prevVNode === "string") {
    if (currentVNode === prevVNode) return;
    return parentElement.replaceChild(createElement(currentVNode), parentElement.childNodes[index]);
  }

  // 4. oldNode와 newNode의 태그 이름(type)이 다를 경우
  if (currentVNode.type !== prevVNode.type) {
    return parentElement.replaceChild(createElement(currentVNode), parentElement.childNodes[index]);
  }

  const element = parentElement.childNodes[index];
  updateAttributes(element, currentVNode.props, prevVNode.props);

  // 자식 노드 비교 및 업데이트
  const newChildren = currentVNode.children || [];
  const oldChildren = prevVNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  Array.from({ length: maxLength }).forEach((_, i) => {
    updateElement(element, newChildren[i] || null, oldChildren[i] || null, i);
  });

  // oldChildren이 더 많을 때 초과된 자식 제거 (역순)
  if (oldChildren.length > newChildren.length) {
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      if (element.childNodes[i]) {
        element.removeChild(element.childNodes[i]);
      }
    }
  }
}
