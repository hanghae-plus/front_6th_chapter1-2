import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, newProps = {}, oldProps = {}) {
  // null 방지
  newProps = newProps || {};
  oldProps = oldProps || {};
  // 1. oldProps 중에 newProps에 없는 건 제거
  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (key.startsWith("on") && typeof oldProps[key] === "function") {
        const eventType = key.slice(2).toLowerCase();
        removeEvent(target, eventType, oldProps[key]);
      } else if (key === "className") {
        target.removeAttribute("class");
      } else {
        target.removeAttribute(key);
      }
    }
  }

  // 2. newProps 처리
  for (const key in newProps) {
    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      if (!oldProps[key] || oldProps[key] !== newProps[key]) {
        if (oldProps[key]) {
          removeEvent(target, eventType, oldProps[key]);
        }
        addEvent(target, eventType, newProps[key]);
      }
    } else if (key === "className") {
      if (oldProps[key] !== newProps[key]) {
        if (newProps[key]) {
          target.setAttribute("class", newProps[key]);
        } else {
          target.removeAttribute("class");
        }
      }
    } else if (key === "checked" || key === "disabled" || key === "readOnly" || key === "selected") {
      // boolean 속성은 property로 직접 설정
      if (oldProps[key] !== newProps[key]) {
        target[key] = newProps[key];
        if (key === "disabled") {
          if (newProps[key]) {
            target.setAttribute(key, "");
          } else {
            target.removeAttribute(key);
          }
        } else if (key === "readOnly") {
          if (newProps[key]) {
            target.setAttribute("readonly", "");
          } else {
            target.removeAttribute("readonly");
          }
        }
      }
    } else {
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
    if (newNode) {
      parentElement.appendChild(createElement(newNode));
    }
    return;
  }

  // 새로운 노드가 삭제된 노드라면 부모 노드에서 삭제
  if (!newNode) {
    if (parentElement.childNodes[index]) {
      parentElement.removeChild(parentElement.childNodes[index]);
    }
    return;
  }

  // 텍스트 노드 처리
  if (typeof newNode === "string" || typeof newNode === "number") {
    if (typeof oldNode === "string" || typeof oldNode === "number") {
      if (newNode !== oldNode) {
        parentElement.childNodes[index].textContent = newNode;
      }
    } else {
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
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];

  // 둘 중 길이가 긴 쪽을 기준으로 반복하기 위해서 Max값 구함
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  // 역순으로 제거 (인덱스 변화를 방지하기 위해)
  for (let i = maxLength - 1; i >= 0; i--) {
    if (i >= newChildren.length) {
      // 새로운 자식이 없으면 제거
      if (parentElement.childNodes[index].childNodes[i]) {
        parentElement.childNodes[index].removeChild(parentElement.childNodes[index].childNodes[i]);
      }
    } else if (i >= oldChildren.length) {
      // 이전 자식이 없으면 추가
      parentElement.childNodes[index].appendChild(createElement(newChildren[i]));
    } else {
      // 둘 다 있으면 재귀적으로 업데이트
      updateElement(parentElement.childNodes[index], newChildren[i], oldChildren[i], i);
    }
  }
}
