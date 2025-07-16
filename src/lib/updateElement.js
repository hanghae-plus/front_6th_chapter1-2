import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

export function updateAttributes(target, newProps, oldProps) {
  // 1) newProps · oldProps 방어
  const np = newProps || {};
  const op = oldProps || {};

  // 2) op에만 있는 키 제거
  for (const key of Object.keys(op)) {
    if (!(key in np)) {
      if (key.startsWith("on")) {
        removeEvent(target, key.slice(2).toLowerCase(), op[key]);
      } else if (key === "className") {
        target.removeAttribute("class");
      } else if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
        target[key] = false;
      } else {
        target.removeAttribute(key);
      }
    }
  }

  // 3) np에 있는 것 추가·변경
  for (const [key, val] of Object.entries(np)) {
    const oldVal = op[key];
    if (val === oldVal) continue;

    if (key.startsWith("on")) {
      const type = key.slice(2).toLowerCase();
      if (oldVal) removeEvent(target, type, oldVal);
      addEvent(target, type, val);
    } else if (key === "className") {
      target.setAttribute("class", val);
    } else if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
      target[key] = val;
    } else if (key === "style" && typeof val === "object") {
      Object.assign(target.style, val);
    } else {
      target.setAttribute(key, val);
    }
  }
}
/**
 * VNode diff & patch: 노드 추가·제거·교체·속성·자식 업데이트
 */
export function updateElement(parent, newNode, oldNode, index = 0) {
  const existingEl = parent.childNodes[index];

  // 1) 둘 다 없으면
  if (newNode == null && oldNode == null) return;

  // 2) old만 있으면 제거
  if (oldNode != null && newNode == null) {
    if (existingEl) parent.removeChild(existingEl);
    return;
  }

  // 3) new만 있으면 추가
  if (newNode != null && oldNode == null) {
    parent.appendChild(createElement(newNode));
    return;
  }

  // 4) 텍스트 노드 비교
  if (
    (typeof newNode === "string" || typeof newNode === "number") &&
    (typeof oldNode === "string" || typeof oldNode === "number")
  ) {
    if (newNode !== oldNode && existingEl) {
      existingEl.textContent = newNode;
    }
    return;
  }

  // 5) 타입(type) 다르면 교체
  if (newNode.type !== oldNode.type) {
    parent.replaceChild(createElement(newNode), existingEl);
    return;
  }

  // 6) 같은 타입 → 속성·이벤트·자식 업데이트
  updateAttributes(existingEl, newNode.props, oldNode.props);

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const minLen = Math.min(newChildren.length, oldChildren.length);

  // 6-1) 공통 인덱스 재귀 업데이트
  for (let i = 0; i < minLen; i++) {
    updateElement(existingEl, newChildren[i], oldChildren[i], i);
  }
  // 6-2) 새 자식 추가
  for (let i = oldChildren.length; i < newChildren.length; i++) {
    existingEl.appendChild(createElement(newChildren[i]));
  }
  // 6-3) 초과 old 자식 제거 (뒤에서부터)
  for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
    const child = existingEl.childNodes[i];
    if (child) existingEl.removeChild(child);
  }
}
