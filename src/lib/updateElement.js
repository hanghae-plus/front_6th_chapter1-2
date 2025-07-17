import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

const booleanAttr = ["checked", "disabled", "readonly", "readOnly", "required", "autofocus", "multiple", "selected"];

const setAttributes = (target, newProps, oldProps) => {
  console.log({ newProps, oldProps });
  for (const [attr, newAttrValue] of Object.entries(newProps)) {
    // 먼저 newProps를 key, value로 나누고

    const oldAttrValue = oldProps[attr];
    if (newAttrValue === oldAttrValue) continue;

    // 이벤트
    if (attr.startsWith("on")) {
      const eventType = attr.slice(2).toLowerCase(); // onClick -> click
      if (oldAttrValue && typeof oldAttrValue === "function") removeEvent(target, eventType, oldAttrValue);
      if (newAttrValue) addEvent(target, eventType, newAttrValue);
      continue;
    }

    if (attr === "className") {
      console.log(attr, "attr.");
      target.setAttribute("class", newAttrValue);
      continue;
    }

    if (attr === "style" && typeof newAttrValue === "object") {
      for (const [styleKey, styleValue] of Object.entries(newAttrValue)) {
        target.style[styleKey] = styleValue;
      }
      continue;
    }

    if (booleanAttr.includes(attr)) {
      target[attr] = !!newAttrValue;
      continue;
    }

    target.setAttribute(attr, newAttrValue);
  }
};

const removeAttributes = (target, newProps, oldProps) => {
  for (const attr of Object.keys(oldProps)) {
    console.log(attr, "attr", newProps, attr in newProps);
    if (!(attr in newProps)) {
      // new Props에 old에 있는 props가 없으면 (사라져야 함)
      if (attr.startsWith("on")) {
        const eventType = attr.slice(2).toLowerCase();
        removeEvent(target, eventType, oldProps[attr]);
        continue;
      }

      // if (attr === "class") {
      //   target.removeAttribute("classname");
      //   continue;
      // }

      if (attr === "className") {
        target.removeAttribute("class");
        continue;
      }

      // style 객체 초기화
      if (attr === "style") {
        target.removeAttribute("style");
        continue;
      }

      if (booleanAttr.includes(attr)) {
        target[attr] = false;
        continue;
      }

      target.removeAttribute(attr);
    }
  }
};

function updateAttributes(target, originNewProps, originOldProps) {
  // 언디파인드 방지
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};
  // old에는 있고 new에는 없음 -> 사라진 속성 지우기
  removeAttributes(target, newProps, oldProps);
  // new에 생긴 새로운 속성
  setAttributes(target, newProps, oldProps);
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const targetElement = parentElement.childNodes[index];

  if (!newNode && oldNode) {
    if (!targetElement) return;
    parentElement.removeChild(targetElement);
    return;
  }

  // 새 노드만 있을 때
  if (newNode && !oldNode) {
    const $el = createElement(newNode);

    const beforeElement = parentElement.childNodes[index];
    if (beforeElement) {
      parentElement.insertBefore($el, beforeElement);
    } else {
      parentElement.appendChild($el);
    }
    updateAttributes($el, newNode?.props, oldNode?.props);
    return;
  }

  if (typeof newNode === "string" || typeof newNode === "number") {
    if (newNode !== oldNode) {
      const $text = document.createTextNode(newNode);
      parentElement.replaceChild($text, targetElement);
    }

    return;
  }

  if (newNode.type !== oldNode.type) {
    const $el = createElement(newNode);
    parentElement.replaceChild($el, targetElement);
    updateAttributes($el, newNode.props, oldNode.props);
    return;
  }

  updateAttributes(targetElement, newNode.props, oldNode.props);
  const newNodeChildren = Array.isArray(newNode.children) ? newNode.children : [];
  const oldNodeChildren = Array.isArray(oldNode.children) ? oldNode.children : [];
  const max = Math.max(newNodeChildren.length, oldNodeChildren.length);

  // 뒤에서부터 처리하여 인덱스 문제 방지
  for (let i = max - 1; i >= 0; i--) {
    updateElement(targetElement, newNodeChildren[i], oldNodeChildren[i], i);
  }
}
