import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, newProps = {}, oldProps = {}) {
  // 1. oldProps 중에 newProps에 없는 건 제거
  for (const [key, value] of Object.entries(oldProps)) {
    if (!(key in newProps)) {
      if (key.startsWith("on") && typeof value === "function") {
        const eventType = key.slice(2).toLowerCase();
        removeEvent(target, eventType, value);
      } else if (key === "className") {
        target.removeAttribute("class");
      } else if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
        target[key] = false;
        target.removeAttribute(key);
      } else {
        target.removeAttribute(key);
      }
    }
  }

  // 2. newProps 처리
  for (const [key, value] of Object.entries(newProps)) {
    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      addEvent(target, eventType, value);
    } else if (key === "className") {
      if (value) {
        target.setAttribute("class", value);
      } else {
        target.removeAttribute("class");
      }
    }
    // Boolean 속성은 property로 직접 설정
    if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
      target[key] = value;
    }
    // 나머지 속성은 attribute로 설정
    else {
      target.setAttribute(key, String(value));
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (!parentElement) return;

  // 예전 노드가 빈 노드면 부모 노드에 추가
  if (!oldNode && newNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  const childNode = parentElement.childNodes[index];
  if (!childNode) return;

  // 새로운 노드가 삭제된 노드라면 부모 노드에서 삭제
  if (!newNode) {
    parentElement.removeChild(childNode);
    return;
  }

  // 텍스트 노드 처리
  if (typeof newNode === "string" || typeof newNode === "number") {
    if (typeof oldNode === "string" || typeof oldNode === "number") {
      // 내용이 다르면 텍스트만 업데이트
      if (newNode !== oldNode) {
        childNode.textContent = newNode;
      }
    }
    // 텍스트 노드가 아니면 새로 교체
    else {
      parentElement.replaceChild(document.createTextNode(newNode), parentElement.childNodes[index]);
    }
    return;
  }

  // 다른 태그면 교체
  if (newNode.type !== oldNode.type) {
    parentElement.replaceChild(createElement(newNode), parentElement.childNodes[index]);
    return;
  }

  // 동일 타입일 때 props 업데이트
  updateAttributes(childNode, newNode.props || {}, oldNode.props || {});

  // 자식 노드 업데이트
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];

  // 둘 중 길이가 긴 쪽을 기준으로 반복하기 위해서 Max값 구함
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  for (let i = 0; i < maxLength; i++) {
    updateElement(childNode, newChildren[i], oldChildren[i], i);
  }

  if (oldChildren.length > newChildren.length) {
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      const extraChild = childNode.childNodes[i];
      if (extraChild) {
        childNode.removeChild(extraChild);
      }
    }
  }
}
