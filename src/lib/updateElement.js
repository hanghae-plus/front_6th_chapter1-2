import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";
import { normalizeVNode } from "./normalizeVNode.js";

function updateAttributes(target, originNewProps, originOldProps) {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  // 기존 속성 제거
  for (const key in oldProps) {
    if (!(key in newProps) && key !== "children") {
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase();
        removeEvent(target, eventType, oldProps[key]);
      } else if (key === "className") {
        target.removeAttribute("class");
      } else {
        target.removeAttribute(key);
      }
    }
  }

  // 새 속성 추가 또는 업데이트
  for (const key in newProps) {
    if (key === "children") continue;

    // on 이벤트
    if (key.startsWith("on") && typeof newProps[key] === "function") {
      const eventType = key.slice(2).toLowerCase();
      if (oldProps[key] !== newProps[key]) {
        if (oldProps[key]) {
          removeEvent(target, eventType, oldProps[key]);
        }
        addEvent(target, eventType, newProps[key]);
      }
      // boolean 프로퍼티 설정
    } else if (typeof newProps[key] === "boolean") {
      if (newProps[key] !== oldProps[key]) {
        target[key] = newProps[key];
      }
      // className 예외처리
    } else if (key === "className") {
      if (newProps[key] !== oldProps[key]) {
        target.setAttribute("class", newProps[key]);
      }
      // 나머지 속성 설정
    } else if (newProps[key] !== oldProps[key]) {
      target.setAttribute(key, newProps[key]);
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const normalizedNewNode = normalizeVNode(newNode);
  const normalizedOldNode = normalizeVNode(oldNode);

  // 기존 노드가 없으면 새로 생성
  if (!normalizedOldNode) {
    const newElement = createElement(normalizedNewNode);
    parentElement.appendChild(newElement);
    return;
  }

  if (parentElement) {
    // 새 노드가 없으면 기존 노드 제거
    if (!normalizedNewNode) {
      parentElement.removeChild(parentElement.childNodes[index]);
      return;
    }

    // 둘 다 텍스트 노드인 경우
    if (typeof normalizedNewNode === "string" && typeof normalizedOldNode === "string") {
      if (normalizedNewNode !== normalizedOldNode) {
        parentElement.childNodes[index].textContent = normalizedNewNode;
      }
      return;
    }

    // 하나는 텍스트, 하나는 요소인 경우 교체
    if (typeof normalizedNewNode === "string" || typeof normalizedOldNode === "string") {
      const newElement = createElement(normalizedNewNode);
      parentElement.replaceChild(newElement, parentElement.childNodes[index]);
      return;
    }

    // 요소 타입이 다르면 교체
    if (normalizedNewNode.type !== normalizedOldNode.type) {
      const newElement = createElement(normalizedNewNode);
      parentElement.replaceChild(newElement, parentElement.childNodes[index]);
      return;
    }

    // 같은 타입의 요소면 속성과 자식들을 업데이트
    const target = parentElement.childNodes[index];
    updateAttributes(target, normalizedNewNode.props, normalizedOldNode.props);

    const newChildren = normalizedNewNode.children || [];
    const oldChildren = normalizedOldNode.children || [];

    // 자식 노드들을 바뀐 수만큼 업데이트
    let i = 0;
    let maxChildrenLength = Math.max(newChildren.length, oldChildren.length);
    while (i < maxChildrenLength) {
      const newChild = newChildren[i];
      const oldChild = oldChildren[i];
      if (!newChild && oldChild) {
        updateElement(target, null, oldChild, i);
        maxChildrenLength -= 1;
      } else {
        updateElement(target, newChild, oldChild, i);
        i += 1;
      }
    }
  }
}
