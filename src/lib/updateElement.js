import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

const setAttributes = (target, newProps, oldProps) => {
  for (const [attr, newAttrValue] of Object.entries(newProps)) {
    // 먼저 newProps를 key, value로 나누고

    const oldAttrValue = oldProps[attr];
    console.log(oldAttrValue, "oldAttrValue");
    if (newAttrValue === oldAttrValue) continue;

    // 이벤트
    if (attr.startsWith("on")) {
      const eventType = attr.slice(2).toLowerCase(); // onClick -> click
      if (oldAttrValue && typeof oldAttrValue === "function") removeEvent(target, eventType, oldAttrValue);
      if (newAttrValue) addEvent(target, eventType, newAttrValue);
      continue;
    }

    if (attr === "className") {
      target.setAttribute("class", newAttrValue);
      continue;
    }

    if (attr === "style" && typeof newAttrValue === "object") {
      for (const [styleKey, styleValue] of Object.entries(newAttrValue)) {
        target.style[styleKey] = styleValue;
      }

      continue;
    }

    target.setAttribute(attr, newAttrValue);
  }
};

const removeAttributes = (target, newProps, oldProps) => {
  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps)) {
      // new Props에 old에 있는 props가 없으면 (사라져야 함)
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase();
        removeEvent(target, eventType, oldProps[key]);
        continue;
      }

      if (key === "className") {
        target.removeAttribute("class");
        continue;
      }

      // style 객체 초기화
      if (key === "style") {
        target.removeAttribute("style");
        continue;
      }

      target.removeAttribute(key);
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

  // new가 없고 old만 있으면 -> 노드 제거
  if (!newNode && oldNode) {
    if (!targetElement) return;
    parentElement.removeChild(targetElement);
    return;
  }

  // new가 있고 old가 없으면 -> 새 노드 추가
  if (newNode && !oldNode) {
    const $el = createElement(newNode);

    const beforeElement = parentElement.childNodes[index];
    if (beforeElement) {
      parentElement.insertBefore($el, beforeElement);
    } else {
      parentElement.appendChild($el);
    }

    return;
  }

  // 텍스트 노드 업데이트
  if (typeof newNode === "string" || typeof oldNode === "string") {
    if (newNode !== oldNode) {
      const $text = document.createTextNode(newNode);
      parentElement.replaceChild($text, targetElement);
    }

    return;
  }

  // new.type !== old.type -> 노드 교체

  if (newNode.type !== oldNode.type) {
    const $el = createElement(newNode);
    parentElement.replaceChild($el, targetElement);
  }

  // 같은 타입의 노드 업데이트 -> 속성 업데이트, 자식 노드 재귀적 업데이트, 불필요한 자식 노드 제거

  updateAttributes(targetElement, newNode.props, oldNode.props);
  // const newNodeChildren = newNode.children || [];
  // const oldNodeChildren = oldNode.children || [];
  const newNodeChildren = Array.isArray(newNode.children) ? newNode.children : [];
  const oldNodeChildren = Array.isArray(oldNode.children) ? oldNode.children : [];
  // 자식 요소 캐치하기 위함
  // newChildren만 돌면 삭제된 요소 감지 못하고
  // oldChildren만 돌면 추가된 요소 감지 못해서
  // 둘 중 더 긴 걸 기준으로 돌기
  const max = Math.max(newNodeChildren.length, oldNodeChildren.length);

  console.log(max, "max..");

  for (let i = 0; i < max; i++) {
    updateElement(targetElement, newNodeChildren[i], oldNodeChildren[i], i);
  }
}
