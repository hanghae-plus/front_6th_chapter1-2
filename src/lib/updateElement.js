import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, originNewProps, originOldProps) {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  // 1. 새로운 속성 추가 및 변경
  for (const attr in newProps) {
    const newValue = newProps[attr];
    const oldValue = oldProps[attr];

    if (newValue !== oldValue) {
      if (attr.startsWith("on") && typeof newValue === "function") {
        const eventType = attr.toLowerCase().slice(2);
        if (oldValue) {
          removeEvent(target, eventType, oldValue);
        }
        addEvent(target, eventType, newValue);
      } else if (["checked", "disabled", "selected", "readOnly"].includes(attr)) {
        target[attr] = Boolean(newValue);
      } else if (attr === "className") {
        newValue ? target.setAttribute("class", newValue) : target.removeAttribute("class");
      } else if (attr === "style" && typeof newValue === "object") {
        for (const styleName in newValue) {
          target.style[styleName] = newValue[styleName];
        }
        for (const styleName in oldValue) {
          if (!(styleName in newValue)) {
            target.style[styleName] = "";
          }
        }
      } else {
        target.setAttribute(attr, newValue);
      }
    }
  }

  // 2. 없어진 속성 제거
  for (const attr in oldProps) {
    if (!(attr in newProps)) {
      if (attr.startsWith("on") && typeof oldProps[attr] === "function") {
        const eventType = attr.toLowerCase().slice(2);
        removeEvent(target, eventType, oldProps[attr]);
      } else if (["checked", "disabled", "selected", "readOnly"].includes(attr)) {
        target[attr] = false;
      } else if (attr === "className") {
        target.removeAttribute("class");
      } else if (attr === "style") {
        for (const styleName in oldProps[attr]) {
          target.style[styleName] = "";
        }
      } else {
        target.removeAttribute(attr);
      }
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 1. oldNode가 없는 경우 (새로운 노드 추가)
  if (!oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  const target = parentElement.childNodes[index];

  // 2. newNode가 없는 경우 (기존 노드 제거)
  if (!newNode) {
    parentElement.removeChild(target);
    return;
  }

  // 3. 노드 타입이 변경된 경우 (기존 노드 교체)
  if (newNode.type !== oldNode.type) {
    parentElement.replaceChild(createElement(newNode), target);
    return;
  }

  // 4. 텍스트 노드인 경우
  if (typeof newNode === "string" && newNode !== oldNode) {
    target.nodeValue = newNode;
    return;
  }

  // 5. 엘리먼트 노드인 경우
  if (newNode.type) {
    // 속성 업데이트
    updateAttributes(target, newNode.props, oldNode.props);

    // 자식 노드 업데이트
    const newChildren = newNode.children || [];
    const oldChildren = oldNode.children || [];

    // 새로운 자식들을 순회하며 업데이트 또는 추가
    for (let i = 0; i < newChildren.length; i++) {
      updateElement(target, newChildren[i], oldChildren[i], i);
    }

    // oldChildren이 newChildren보다 많을 경우, 초과하는 자식들을 제거
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      target.removeChild(target.childNodes[i]);
    }
  }
}
