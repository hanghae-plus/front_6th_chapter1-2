import { addEvent, removeEvent, clearAllEvents } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, originNewProps, originOldProps) {
  originNewProps = originNewProps || {};
  originOldProps = originOldProps || {};
  // 제거된 속성 및 변경된/무효화된 이벤트 핸들러
  Object.keys(originOldProps).forEach((key) => {
    if (key.startsWith("on") && typeof originOldProps[key] === "function") {
      // 새 props에 없거나, 함수가 다르거나, 새 props가 함수가 아니면 제거
      if (
        !(key in originNewProps) ||
        typeof originNewProps[key] !== "function" ||
        originNewProps[key] !== originOldProps[key]
      ) {
        removeEvent(target, key.slice(2).toLowerCase(), originOldProps[key]);
      }
    } else if (!(key in originNewProps)) {
      target.removeAttribute(key === "className" ? "class" : key);
    }
  });
  // 추가/변경된 속성
  Object.keys(originNewProps).forEach((key) => {
    const value = originNewProps[key];

    if (key === "checked" || key === "disabled" || key === "selected" || key === "readOnly") {
      target[key] = !!value;
      return; // setAttribute 호출 안 함
    }

    if (key.startsWith("on") && typeof value === "function") {
      addEvent(target, key.slice(2).toLowerCase(), value);
    } else if (key === "className") {
      target.setAttribute("class", value);
    } else if (key.startsWith("data-")) {
      target.setAttribute(key, value);
    } else {
      target.setAttribute(key, value);
    }
  });
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const childNodes = parentElement.childNodes;
  const existing = childNodes[index];

  // 텍스트 노드
  if (typeof newNode === "string" || typeof newNode === "number") {
    if (existing && existing.nodeType === Node.TEXT_NODE) {
      if (existing.textContent !== String(newNode)) {
        existing.textContent = String(newNode);
      }
    } else {
      const textNode = document.createTextNode(String(newNode));
      if (existing) parentElement.replaceChild(textNode, existing);
      else parentElement.appendChild(textNode);
    }
    return;
  }

  // null/undefined/boolean은 빈 텍스트 노드로 처리
  if (newNode === null || newNode === undefined || typeof newNode === "boolean") {
    if (existing) {
      parentElement.removeChild(existing);
    }
    return;
  }

  // vNode 객체
  if (typeof newNode === "object" && typeof newNode.type === "string") {
    if (!existing) {
      parentElement.appendChild(createElement(newNode));
      return;
    }
    if (existing.nodeType !== Node.ELEMENT_NODE || existing.nodeName.toLowerCase() !== newNode.type.toLowerCase()) {
      // 노드가 교체될 때 기존 노드의 모든 이벤트를 제거
      if (existing.nodeType === Node.ELEMENT_NODE) {
        clearAllEvents(existing);
      }
      parentElement.replaceChild(createElement(newNode), existing);
      return;
    }
    // 속성 동기화
    updateAttributes(existing, newNode.props, oldNode && oldNode.props);
    // 자식 동기화
    const newChildren = Array.isArray(newNode.children) ? newNode.children : [newNode.children];
    const oldChildren =
      oldNode && Array.isArray(oldNode.children) ? oldNode.children : oldNode ? [oldNode.children] : [];
    const max = Math.max(newChildren.length, existing.childNodes.length);
    for (let i = 0; i < max; i++) {
      updateElement(existing, newChildren[i], oldChildren[i], i);
    }
    // 남은 기존 노드 삭제
    while (existing.childNodes.length > newChildren.length) {
      existing.removeChild(existing.childNodes[existing.childNodes.length - 1]);
    }
    return;
  }
}
