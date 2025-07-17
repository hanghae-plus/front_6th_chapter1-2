import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

/**
 * DOM 엘리먼트의 속성을 업데이트하는 함수
 * 이전 속성을 제거하고 새로운 속성을 설정
 * @param {HTMLElement} target - 업데이트할 DOM 엘리먼트
 * @param {Object} newProps - 새로운 속성 객체
 * @param {Object} oldProps - 이전 속성 객체
 */
function updateAttributes(target, newProps, oldProps) {
  for (const [key, value] of Object.entries(oldProps)) {
    if (key === "children") continue;
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      removeEvent(target, eventType, value);
    } else if (!(key in newProps)) {
      // 2. 'className' 속성 제거
      if (key === "className") {
        target.removeAttribute("class");
      }
      // 3. 불리언 속성 제거
      else if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
        target[key] = false;
        target.removeAttribute(key);
      }
      // 4. 그 외 일반 속성 제거
      else {
        target.removeAttribute(key);
      }
    }
  }
  // 2. newProps 처리
  for (const [key, value] of Object.entries(newProps)) {
    if (key === "children") continue;

    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      addEvent(target, eventType, value);
    } else if (key === "className") {
      value ? target.setAttribute("class", value) : target.removeAttribute("class");
    }
    // Boolean 속성은 property로 직접 설정
    else if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
      target[key] = value;
    }
    // 나머지 속성은 attribute로 설정
    else {
      target.setAttribute(key, value);
    }
  }
}

/**
 * Virtual DOM의 변경사항을 실제 DOM에 반영하는 함수
 * 재귀적으로 자식 노드들을 비교하여 효율적으로 DOM을 업데이트
 * @param {HTMLElement} parentElement - 부모 DOM 엘리먼트
 * @param {any} newNode - 새로운 Virtual DOM 노드
 * @param {any} oldNode - 이전 Virtual DOM 노드
 * @param {number} index - 자식 노드의 인덱스 (기본값: 0)
 */
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
