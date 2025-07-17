import { createElement } from "./createElement";
import { addEvent, removeEvent } from "./eventManager";

function setProp($el, key, value) {
  if (key === "children") return;

  if (key === "className") {
    if (value) {
      $el.className = value;
    } else {
      $el.removeAttribute("class");
    }
  } else if (key === "checked" || key === "selected") {
    $el[key] = !!value;
    $el.removeAttribute(key);
  } else if (key === "disabled" || key === "readOnly") {
    if (value) {
      $el.setAttribute(key, "");
      $el[key] = true;
    } else {
      $el.removeAttribute(key);
      $el[key] = false;
    }
  } else if (key === "value" && ($el.tagName === "INPUT" || $el.tagName === "TEXTAREA" || $el.tagName === "SELECT")) {
    // form 요소들의 value는 property로 설정
    $el.value = value;
  } else if (key.startsWith("on") && typeof value === "function") {
    const eventType = key.toLowerCase().substring(2);
    addEvent($el, eventType, value);
  } else if (value === false || value === null || value === undefined) {
    $el.removeAttribute(key);
  } else {
    $el.setAttribute(key, value);
  }
}

function updateAttributes($el, oldProps = {}, newProps = {}) {
  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

  allKeys.forEach((key) => {
    if (key === "children") return;

    const oldValue = oldProps[key];
    const newValue = newProps[key];

    if (oldValue !== newValue) {
      if (key.startsWith("on") && typeof oldValue === "function") {
        const eventType = key.toLowerCase().substring(2);
        removeEvent($el, eventType, oldValue);
      }
      setProp($el, key, newValue);
    }
  });
}

function updateChildren($parent, oldChildren = [], newChildren = []) {
  // 배열이 아닌 경우 빈 배열로 처리
  const safeOldChildren = Array.isArray(oldChildren) ? oldChildren : [];
  const safeNewChildren = Array.isArray(newChildren) ? newChildren : [];

  const oldLen = safeOldChildren.length;
  const newLen = safeNewChildren.length;
  const currentDomChildren = Array.from($parent.childNodes); // NodeList를 배열로 변환 (실시간 변경 방지)

  // 기존 자식 요소들 업데이트
  for (let i = 0; i < Math.min(oldLen, newLen); i++) {
    updateElement(currentDomChildren[i], safeOldChildren[i], safeNewChildren[i]);
  }

  // 새로운 자식 요소들 추가
  if (newLen > oldLen) {
    for (let i = oldLen; i < newLen; i++) {
      const childElement = createElement(safeNewChildren[i]);
      if (childElement) {
        $parent.appendChild(childElement);
      }
    }
  }
  // 불필요한 자식 요소들 제거
  else if (oldLen > newLen) {
    // 뒤에서부터 제거 (인덱스 변경 문제 방지)
    for (let i = oldLen - 1; i >= newLen; i--) {
      if (currentDomChildren[i]) {
        $parent.removeChild(currentDomChildren[i]);
      }
    }
  }
}

export function updateElement($el, oldVNode, newVNode) {
  // 같은 참조면 업데이트 불필요
  if (oldVNode === newVNode) return;

  // 텍스트 노드 처리
  if (typeof newVNode === "string" || typeof newVNode === "number") {
    if ($el.textContent !== String(newVNode)) {
      $el.textContent = String(newVNode);
    }
    return;
  }

  // 이전이 텍스트였는데 지금은 요소인 경우
  if (typeof oldVNode === "string" || typeof oldVNode === "number") {
    const newElement = createElement(newVNode);
    if (newElement) {
      $el.parentNode.replaceChild(newElement, $el);
    }
    return;
  }

  // 요소 타입이 바뀐 경우 (div -> span 등)
  if (oldVNode.type !== newVNode.type) {
    const newElement = createElement(newVNode);
    if (newElement) {
      $el.parentNode.replaceChild(newElement, $el);
    }
    return;
  }

  // 같은 타입이면 속성과 자식만 업데이트 (성능 최적화)
  updateAttributes($el, oldVNode?.props || {}, newVNode?.props || {});
  updateChildren($el, oldVNode?.children || [], newVNode?.children || []);
}
