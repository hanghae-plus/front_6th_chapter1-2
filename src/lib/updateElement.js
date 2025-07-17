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
      // 수정됨: 함수 타입 체크 추가
      if (newAttrValue && typeof newAttrValue === "function") addEvent(target, eventType, newAttrValue);
      continue;
    }

    if (attr === "className") {
      console.log(attr, "attr.");
      // 수정됨: falsy 값 처리 개선
      if (newAttrValue) {
        target.setAttribute("class", newAttrValue);
      } else {
        target.removeAttribute("class");
      }
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

    // 수정됨: null 값 처리 개선
    if (newAttrValue != null) {
      target.setAttribute(attr, String(newAttrValue));
    } else {
      target.removeAttribute(attr);
    }
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
        // 수정됨: 불린 속성도 어트리뷰트 제거
        target.removeAttribute(attr);
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
    // 수정됨: 중복 속성 설정 제거 (createElement에서 이미 처리됨)
    // updateAttributes($el, newNode?.props, oldNode?.props);
    return;
  }

  if (typeof newNode === "string" || typeof newNode === "number") {
    if (newNode !== oldNode) {
      const $text = document.createTextNode(newNode);
      // 수정됨: 안전성 체크 추가
      if (targetElement) {
        parentElement.replaceChild($text, targetElement);
      } else {
        parentElement.appendChild($text);
      }
    }

    return;
  }

  if (newNode.type !== oldNode.type) {
    const $el = createElement(newNode);
    // 수정됨: 안전성 체크 추가
    if (targetElement) {
      parentElement.replaceChild($el, targetElement);
    } else {
      parentElement.appendChild($el);
    }
    // 수정됨: 중복 속성 설정 제거 (createElement에서 이미 처리됨)
    // updateAttributes($el, newNode.props, oldNode.props);
    return;
  }

  updateAttributes(targetElement, newNode.props, oldNode.props);
  const newNodeChildren = Array.isArray(newNode.children) ? newNode.children : [];
  const oldNodeChildren = Array.isArray(oldNode.children) ? oldNode.children : [];
  const max = Math.max(newNodeChildren.length, oldNodeChildren.length);

  // 수정됨: 순차 처리로 변경 (안전성 향상)
  for (let i = 0; i < max; i++) {
    updateElement(targetElement, newNodeChildren[i], oldNodeChildren[i], i);
  }

  // 수정됨: 잉여 노드 제거 로직 추가 (중요!)
  if (oldNodeChildren.length > newNodeChildren.length) {
    for (let i = oldNodeChildren.length - 1; i >= newNodeChildren.length; i--) {
      const extraChild = targetElement.childNodes[i];
      if (extraChild) {
        targetElement.removeChild(extraChild);
      }
    }
  }
}
