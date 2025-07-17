import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

const BOOLEAN_PROPS = ["checked", "disabled", "selected", "readOnly"];

function updateAttributes(dom, newProps = {}, oldProps = {}) {
  // 새 props 추가 또는 변경
  for (const key in newProps) {
    const newVal = newProps[key];
    const oldVal = oldProps[key];

    if (newVal !== oldVal) {
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase();
        if (typeof oldVal === "function") removeEvent(dom, eventType, oldVal);
        if (typeof newVal === "function") addEvent(dom, eventType, newVal);
      } else if (key === "className") {
        dom.setAttribute("class", newVal);
      } else if (BOOLEAN_PROPS.includes(key)) {
        dom[key] = Boolean(newVal);
      } else if (key in dom && key !== "children") {
        // children은 getter-only
        dom[key] = newVal;
      } else {
        dom.setAttribute(key, newVal);
      }
    }
  }

  // 제거된 props 처리
  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (key.startsWith("on") && typeof oldProps[key] === "function") {
        const eventType = key.slice(2).toLowerCase();
        removeEvent(dom, eventType, oldProps[key]);
      } else if (key === "className") {
        dom.removeAttribute("class");
      } else if (BOOLEAN_PROPS.includes(key)) {
        dom[key] = false;
      } else {
        dom.removeAttribute(key);
      }
    }
  }
}
export function updateElement(parent, newNode, oldNode, index = 0) {
  const dom = parent.childNodes[index];

  // 1. oldNode가 없으면 새로 추가
  if (!oldNode) {
    parent.appendChild(createElement(newNode));
    return;
  }

  // 2. newNode가 없으면 제거
  if (!newNode) {
    if (dom) parent.removeChild(dom);
    return;
  }

  // 3. 타입 또는 태그가 다르면 교체
  if (
    typeof newNode !== typeof oldNode ||
    (typeof newNode === "string" && newNode !== oldNode) ||
    (newNode.type && newNode.type !== oldNode.type)
  ) {
    parent.replaceChild(createElement(newNode), dom);
    return;
  }

  // 4. 텍스트 노드 업데이트
  if (typeof newNode === "string") {
    if (dom.textContent !== newNode) {
      dom.textContent = newNode;
    }
    return;
  }

  // 5. 속성 업데이트
  updateAttributes(dom, newNode.props || {}, oldNode.props || {});

  // 6. 자식 노드 비교
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];

  // 7. 초과된 자식 제거
  while (dom.childNodes.length > newChildren.length) {
    dom.removeChild(dom.lastChild);
  }

  // 8. 나머지 재귀적 업데이트
  const max = Math.max(newChildren.length, oldChildren.length);
  for (let i = 0; i < max; i++) {
    updateElement(dom, newChildren[i], oldChildren[i], i);
  }
}
