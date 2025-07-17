import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, originNewProps, originOldProps) {
  // 언디파인드 방지
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};
  // new에 생긴 새로운 속성
  for (const [key, newVal] of Object.entries(newProps)) {
    // 먼저 newProps를 key, value로 나누고

    const oldVal = oldProps[key];
    if (newVal === oldVal) continue;

    // 이벤트
    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase(); // onClick -> click
      if (oldVal) removeEvent(target, eventType, oldVal);
      if (newVal) addEvent(target, eventType, newVal);
    }

    if (key === "className") {
      target.setAttributes("class", newVal);
    }

    if (key === "style" && typeof newVal === "object") {
      for (const [styleKey, styleValue] of Object.entries(newVal)) {
        target.style[styleKey] = styleValue;
      }
    }

    target.setAttributes(key, newVal);
  }

  // old에는 있고 new에는 없음 -> 사라진 속성 지우기
  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps)) {
      // new Props에 old에 있는 props가 없으면 (사라져야 함)
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase();
        removeEvent(target, eventType, oldProps[key]);
      }

      target.removeAttributes(key);
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const targetElement = parentElement.children[index];

  // new가 없고 old만 있으면 -> 노드 제거
  if (!newNode && oldNode) {
    if (!targetElement) return;
    parentElement.removeChild(targetElement);
    return;
  }

  // new가 있고 old가 없으면 -> 새 노드 추가
  if (newNode && !oldNode) {
    const $el = createElement(newNode);
    // parentElement.appendChild($el); // 맨 마지막에 추가됨
    // return;

    const beforeElement = parentElement.childNodes[index];
    if (beforeElement) {
      parentElement.insertBefore($el, beforeElement);
    } else {
      parentElement.appendChild($el);
    }

    return;
  }

  // 텍스트 노드 업데이트
  if (typeof newNode === "string" || typeof oldNode === "string") {
    if (newNode !== oldNode) {
      const $text = document.createTextNode(newNode);
      parentElement.replaceChild($text, targetElement);
    }

    return;
  }

  // new.type !== old.type -> 노드 교체

  if (newNode.type !== oldNode.type) {
    const $el = createElement(newNode);
    parentElement.replaceChild($el, targetElement);
  }

  if (!targetElement) {
    console.log("sdfsd");
    return;
  }

  // 같은 타입의 노드 업데이트 -> 속성 업데이트, 자식 노드 재귀적 업데이트, 불필요한 자식 노드 제거

  updateAttributes(targetElement, newNode.props, oldNode.props);
  const newNodeChildren = newNode.children || [];
  const oldNodeChildren = oldNode.children || [];
  // 자식 요소 캐치하기 위함
  // newChildren만 돌면 삭제된 요소 감지 못하고
  // oldChildren만 돌면 추가된 요소 감지 못해서
  // 둘 중 더 긴 걸 기준으로 돌기
  const max = Math.max(newNodeChildren.length, oldNodeChildren.length);

  for (let i = 0; i < max; i++) {
    updateElement(targetElement, newNodeChildren[i], oldNodeChildren[i], i);
  }
}
