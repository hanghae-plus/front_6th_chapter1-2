import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, originNewProps, originOldProps) {
  const isEventProp = (key) => /^on[A-Z]/.test(key);
  const getEventName = (key) => key.slice(2).toLowerCase();

  const setBoolean = (key, val) => {
    // 1. DOM 프로퍼티
    target[key] = !!val;

    // 2. 속성이 필요한 녀석(disabled, readonly)은 빈 문자열로,
    //    그렇지 않은 녀석(checked, selected)은 제거
    const needsAttr = key === "disabled" || key === "readOnly";
    const attrName = key === "readOnly" ? "readonly" : key; // HTML 속성은 소문자

    if (val) {
      needsAttr ? target.setAttribute(attrName, "") : target.removeAttribute(attrName);
    } else {
      target.removeAttribute(attrName);
    }
  };

  // 추가 또는 변경된 속성
  for (const [key, value] of Object.entries(originNewProps)) {
    if (originOldProps[key] === value) continue;

    if (isEventProp(key)) {
      const eventName = getEventName(key);
      if (originOldProps[key]) removeEvent(target, eventName, originOldProps[key]);
      addEvent(target, eventName, value);
    } else if (key === "className") {
      // className: 빈 문자열이면 속성을 지우고, 아니면 교체
      value ? target.setAttribute("class", value) : target.removeAttribute("class");
    } else if (typeof value === "boolean") {
      setBoolean(key, value);
    } else {
      target.setAttribute(key, value);
    }
  }

  // 제거된 속성
  for (const key of Object.keys(originOldProps)) {
    if (!(key in originNewProps)) {
      if (isEventProp(key)) {
        removeEvent(target, getEventName(key), originOldProps[key]);
      } else if (key === "className") {
        target.removeAttribute("class");
      } else if (typeof originOldProps[key] === "boolean") {
        setBoolean(key, false);
      } else {
        target.removeAttribute(key);
      }
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const existingDom = parentElement.childNodes[index];

  // 1. oldNode만 있는 경우 → 제거
  if (!newNode && oldNode) {
    parentElement.removeChild(existingDom);
    return;
  }

  // 2. newNode만 있는 경우 → 추가
  if (newNode && !oldNode) {
    const newEl = createElement(newNode);
    parentElement.appendChild(newEl);
    return;
  }

  // 3. 텍스트 노드 비교
  if (typeof newNode === "string" && typeof oldNode === "string") {
    if (newNode === oldNode) return; // 동일한 텍스트 노드인 경우

    if (existingDom?.nodeType === Node.TEXT_NODE) {
      existingDom.textContent = newNode;
    } else if (parentElement?.nodeType === Node.ELEMENT_NODE) {
      const newTextNode = document.createTextNode(newNode);
      parentElement.replaceChild(newTextNode, existingDom);
    }
    return;
  }

  // 4. 타입 다르면 교체
  if (newNode.type !== oldNode.type) {
    const newEl = createElement(newNode);
    parentElement.replaceChild(newEl, existingDom);
    return;
  }

  // 5. 속성 업데이트
  updateAttributes(existingDom, newNode.props || {}, oldNode.props || {});

  // 6. 자식 노드 diff
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLen = Math.max(newChildren.length, oldChildren.length);

  for (let i = maxLen - 1; i >= 0; i--) {
    updateElement(existingDom, newChildren[i], oldChildren[i], i);
  }
}
