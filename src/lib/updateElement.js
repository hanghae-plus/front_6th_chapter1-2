import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, newProps = {}, oldProps = {}) {
  // 1. oldProps 중에 newProps에 없는 건 제거
  for (const key in oldProps) {
    // newProps에 없는 속성이라면
    if (!(key in newProps)) {
      // 이벤트 핸들러면 removeEvent로 제거
      if (key.startsWith("on") && typeof oldProps[key] === "function") {
        const eventType = key.slice(2).toLowerCase();
        removeEvent(target, eventType, oldProps[key]);
      } else {
        // 일반 속성은 DOM에서 삭제
        target.removeAttribute(key);
      }
    }
  }

  // newProps 중에  새로 생긴거 추가
  for (const key in newProps) {
    // 이벤트 핸들러 처리
    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();

      // oldProps에 없거나 다르면 추가
      if (!oldProps[key] || oldProps[key] !== newProps[key]) {
        if (oldProps[key]) {
          removeEvent(target, eventType, oldProps[key]);
        }
        addEvent(target, eventType, newProps[key]);
      }
    }

    // 이벤트 핸들러가 아닌 기본 속성 처리
    else {
      if (oldProps[key] !== newProps[key]) {
        target.setAttribute(key, newProps[key]);
      }
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (!parentElement) {
    return;
  }

  // 예전 노드가 빈 노드면 부모 노드에 추가
  if (!oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }
  // 새로운 노드가 삭제된 노드라면 부모 노드에서 삭제
  if (!newNode) {
    parentElement.removeChild(oldNode);
    return;
  }

  // 텍스트 노드 처리
  if (typeof newNode === "string" || typeof newNode === "number") {
    if (typeof oldNode === "string" || typeof oldNode === "number") {
      // 텍스트가 바뀌었으면 업데이트
      if (newNode !== oldNode) {
        parentElement.childNodes[index].textContent = newNode;
      }
    } else {
      // oldNode가 엘리먼트면 텍스트 노드로 교체
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
  updateAttributes(parentElement.childNodes[index], newNode.props, oldNode.props);

  // 자식 노드 업데이트
  const maxLength = Math.max(newNode.children.length, oldNode.children.length);
  for (let i = 0; i < maxLength; i++) {
    updateElement(parentElement.childNodes[index], newNode.children[i], oldNode.children[i], i);
  }
}
