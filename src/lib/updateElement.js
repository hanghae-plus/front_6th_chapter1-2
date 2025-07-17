import { addEvent, removeEvent } from "./eventManager.js";
import { createElement } from "./createElement.js";

function updateProps($el, newProps = {}, oldProps = {}) {
  // 새로운 key 와 기존 key 모두 순회
  const keys = new Set([...Object.keys(newProps), ...Object.keys(oldProps)]);

  keys.forEach((key) => {
    if (key === "children") return;

    const newVal = newProps[key];
    const oldVal = oldProps[key];

    // 이벤트 핸들러
    if (key.startsWith("on") && typeof (newVal ?? oldVal) === "function") {
      const evt = key.toLowerCase().substring(2);
      if (oldVal) removeEvent($el, evt, oldVal);
      if (newVal) addEvent($el, evt, newVal);
      return;
    }

    // 속성이 제거된 경우
    if (newVal === undefined) {
      if (key === "className") {
        $el.removeAttribute("class");
      } else if (typeof oldVal === "boolean") {
        $el[key] = false;
        if (key === "disabled") {
          $el.removeAttribute("disabled");
        } else if (key === "readOnly") {
          $el.removeAttribute("readonly");
        } else {
          $el.removeAttribute(key);
        }
      } else {
        $el.removeAttribute(key);
      }
      return;
    }

    // className
    if (key === "className") {
      if (newVal) {
        $el.className = newVal;
      } else {
        $el.removeAttribute("class");
        $el.className = "";
      }
      return;
    }

    // data-* 속성 처리
    if (key.startsWith("data-")) {
      const dataKey = key.slice(5);
      if (newVal == null) {
        delete $el.dataset[dataKey];
      } else {
        $el.dataset[dataKey] = newVal;
      }
      return;
    }

    // 불리언 속성 처리
    if (typeof newVal === "boolean") {
      $el[key] = newVal;
      if (key === "disabled") {
        if (newVal) $el.setAttribute("disabled", "");
        else $el.removeAttribute("disabled");
      } else if (key === "readOnly") {
        if (newVal) $el.setAttribute("readonly", "");
        else $el.removeAttribute("readonly");
      } else {
        // checked, selected 등은 attribute 를 두지 않음
        if ($el.hasAttribute(key)) $el.removeAttribute(key);
      }
      return;
    }

    // 일반 문자열 / 숫자 속성
    if (newVal !== oldVal) {
      $el.setAttribute(key, newVal);
    }
  });
}

export function updateElement(parent, newVNode, oldVNode, index = 0) {
  const $existing = parent.childNodes[index];

  // oldVNode 가 없으면 새로 추가
  if (oldVNode == null) {
    const $new = createElement(newVNode);
    parent.appendChild($new);
    return;
  }

  // newVNode 가 없으면 제거
  if (newVNode == null) {
    parent.removeChild($existing);
    return;
  }

  // 텍스트 노드 처리
  if (typeof newVNode === "string" || typeof newVNode === "number") {
    if (typeof oldVNode === "string" || typeof oldVNode === "number") {
      if (newVNode !== oldVNode) {
        $existing.textContent = String(newVNode);
      }
    } else {
      const $new = createElement(newVNode);
      parent.replaceChild($new, $existing);
    }
    return;
  }

  // 타입이 다르면 교체
  if (!oldVNode || typeof oldVNode !== "object" || newVNode.type !== oldVNode.type) {
    const $new = createElement(newVNode);
    parent.replaceChild($new, $existing);
    return;
  }

  // 동일한 타입 -> 속성 업데이트
  updateProps($existing, newVNode.props || {}, oldVNode.props || {});

  // 자식 비교
  const newChildren = newVNode.children || [];
  const oldChildren = oldVNode.children || [];

  // 1) 공통 길이만큼 재귀 업데이트
  const commonLength = Math.min(newChildren.length, oldChildren.length);
  for (let i = 0; i < commonLength; i++) {
    updateElement($existing, newChildren[i], oldChildren[i], i);
  }

  // 2) 새 자식이 더 많은 경우 추가
  if (newChildren.length > oldChildren.length) {
    for (let i = commonLength; i < newChildren.length; i++) {
      const $child = createElement(newChildren[i]);
      $existing.appendChild($child);
    }
  }

  // 3) 이전 자식이 더 많은 경우 제거 (역순으로 삭제해 인덱스 변동 방지)
  if (oldChildren.length > newChildren.length) {
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      $existing.removeChild($existing.childNodes[i]);
    }
  }
}
