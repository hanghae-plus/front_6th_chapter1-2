import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, newProps, oldProps) {
  newProps = newProps || {};
  oldProps = oldProps || {};

  // 이전 속성 제거
  Object.keys(oldProps).forEach((key) => {
    if (key === "children") return;
    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      if (oldProps[key]) removeEvent(target, eventType, oldProps[key]);
    } else if (!(key in newProps)) {
      if (key === "className") {
        target.removeAttribute("class");
      } else if (["checked", "disabled", "readOnly", "selected"].includes(key)) {
        target[key] = false;
        target.removeAttribute(key);
      } else {
        target.removeAttribute(key);
      }
    }
  });

  // 새로운 속성 추가/업데이트
  Object.entries(newProps).forEach(([key, value]) => {
    if (key === "children") return;
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      addEvent(target, eventType, value);
    } else if (key === "className") {
      if (value) {
        target.setAttribute("class", value);
      } else {
        target.removeAttribute("class");
      }
    } else if (["checked", "disabled", "readOnly", "selected"].includes(key)) {
      target[key] = !!value;
      if (["disabled", "readOnly"].includes(key)) {
        if (value) target.setAttribute(key, "");
        else target.removeAttribute(key);
      }
    } else {
      if (value === false || value === null || value === undefined) {
        target.removeAttribute(key);
      } else {
        target.setAttribute(key, value);
      }
    }
  });
}

export function updateElement(parentElement, newVNode, oldVNode, index = 0) {
  const existingDom = parentElement.childNodes[index];

  // oldNode만 있는 경우: 삭제
  if (!newVNode && oldVNode) {
    if (existingDom) parentElement.removeChild(existingDom);
    return;
  }

  // newNode만 있는 경우: 추가
  if (newVNode && !oldVNode) {
    parentElement.appendChild(createElement(newVNode));
    return;
  }

  // 텍스트/숫자 노드 처리
  if (typeof newVNode === "string" || typeof newVNode === "number") {
    if (newVNode !== oldVNode) {
      const newTextNode = document.createTextNode(String(newVNode));
      if (existingDom) {
        parentElement.replaceChild(newTextNode, existingDom);
      } else {
        parentElement.appendChild(newTextNode);
      }
    }
    return;
  }

  // 타입이 다르면 교체
  if (newVNode.type !== oldVNode.type) {
    if (existingDom) {
      parentElement.replaceChild(createElement(newVNode), existingDom);
    } else {
      parentElement.appendChild(createElement(newVNode));
    }
    return;
  }

  // 동일 타입: 속성/이벤트/children 업데이트
  if (existingDom) {
    updateAttributes(existingDom, newVNode.props, oldVNode.props);

    const newChildren = newVNode.children || [];
    const oldChildren = oldVNode.children || [];
    const maxLength = Math.max(newChildren.length, oldChildren.length);
    for (let i = 0; i < maxLength; i++) {
      updateElement(existingDom, newChildren[i], oldChildren[i], i);
    }

    // oldChildren이 더 많을 때 초과된 자식 제거
    if (oldChildren.length > newChildren.length) {
      for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
        if (existingDom.childNodes[i]) {
          existingDom.removeChild(existingDom.childNodes[i]);
        }
      }
    }
  }
}
