import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

/**
 * 속성을 업데이트하는 함수
 *
 * @param {HTMLElement} target 대상 요소
 * @param {object} originNewProps 새 속성 객체
 * @param {object} originOldProps 이전 속성 객체
 */
const BOOLEAN_PROPS = ["checked", "disabled", "selected", "readOnly"];
function updateAttributes(target, originNewProps, originOldProps) {
  const oldKeys = new Set(Object.keys(originOldProps));
  const newKeys = new Set(Object.keys(originNewProps));

  for (const key of oldKeys) {
    if (key === "className") {
      target.removeAttribute("class");
      continue;
    }

    if (key.startsWith("on")) {
      if (typeof originOldProps[key] === "function") {
        removeEvent(target, key.slice(2).toLowerCase(), originOldProps[key]);
      }
      continue;
    }

    target.removeAttribute(key);
  }

  for (const key of newKeys) {
    if (key === "className") {
      if (originNewProps[key]) {
        target.setAttribute("class", originNewProps[key]);
      } else {
        target.removeAttribute("class");
      }
      continue;
    }

    if (key.startsWith("on")) {
      if (typeof originNewProps[key] === "function") {
        addEvent(target, key.slice(2).toLowerCase(), originNewProps[key]);
      }
      continue;
    }

    if (BOOLEAN_PROPS.includes(key)) {
      target[key] = Boolean(originNewProps[key]);
      continue;
    }

    target.setAttribute(key, originNewProps[key]);
  }
}

/**
 * 노드 업데이트 (diff 알고리즘)
 *
 * @param {HTMLElement} parentElement 부모 요소
 * @param {any} newNode 새 노드
 * @param {any} oldNode 이전 노드
 * @param {number} index 인덱스 (최초 시작 = 0)
 * @returns
 */
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const oldElement = parentElement.childNodes[index];

  // 1. 이전 노드 제거
  if (!newNode && oldNode) {
    if (oldElement) parentElement.removeChild(oldElement);
    return;
  }

  // 2. 새 노드 추가
  if (newNode && !oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  // 3. 텍스트 노드 업데이트
  if (typeof newNode === "string" || typeof newNode === "number") {
    const newTextNode = document.createTextNode(String(newNode));
    if (oldElement) {
      parentElement.replaceChild(newTextNode, oldElement);
    } else {
      parentElement.appendChild(newTextNode);
    }
    return;
  }

  // 4. 노드 교체
  if (newNode.type !== oldNode.type) {
    parentElement.replaceChild(createElement(newNode), oldElement);
    return;
  }

  updateAttributes(oldElement, newNode.props || {}, oldNode.props || {});

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  // 자식 diff
  for (let i = 0; i < maxLength; i++) {
    updateElement(oldElement, newChildren[i], oldChildren[i], i);
  }

  // oldChildren이 더 많은 경우, 남아있는 자식 노드 제거
  if (oldChildren.length > newChildren.length) {
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      if (oldElement.childNodes[i]) {
        oldElement.removeChild(oldElement.childNodes[i]);
      }
    }
  }
}
