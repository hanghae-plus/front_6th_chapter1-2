import { addEvent, eventInstance, removeEvent } from "./eventManager";
import { createElement } from "./createElement";
import { NormalizeVNodeType, PropsType } from "./types.js";

function compareProps(newProps: PropsType, oldProps: PropsType) {
  const propsToAdd: PropsType = {};
  const propsToRemove: string[] = [];

  // 추가하거나 변경된 props 찾기
  for (const [key, value] of Object.entries(newProps)) {
    if (oldProps[key] !== value) {
      propsToAdd[key] = value;
    }
  }

  // 삭제할 props 찾기
  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps)) {
      propsToRemove.push(key);
    }
  }

  return { propsToAdd, propsToRemove };
}

function updateAttributes(target: HTMLElement, originNewProps: PropsType, originOldProps: PropsType) {
  if (!target) {
    return;
  }
  const newProps = { ...originNewProps };
  const oldProps = { ...originOldProps };

  const { propsToAdd, propsToRemove } = compareProps(newProps, oldProps);

  // 추가/변경된 Props를 반영
  for (const [attr, value] of Object.entries(propsToAdd)) {
    if (attr.startsWith("on") && typeof value === "function") {
      // 기존 이벤트가 있다면 제거
      if (oldProps[attr]) {
        removeEvent(target, attr.slice(2).toLowerCase() as keyof HTMLElementEventMap, oldProps[attr] as EventListener);
      }
      // 새 이벤트 추가
      addEvent(target, attr.slice(2).toLowerCase() as keyof HTMLElementEventMap, value as EventListener);
      continue;
    }

    if (attr === "className") {
      target.setAttribute("class", value);
      continue;
    }
    if (attr === "style" && typeof value === "object") {
      Object.assign(target.style, value);
      continue;
    }
    if (typeof value === "boolean") {
      target[attr] = value;
      continue;
    }

    target.setAttribute(attr, value);
  }

  // 삭제할 props 처리
  for (const attr of propsToRemove) {
    if (attr.startsWith("on")) {
      removeEvent(target, attr.slice(2).toLowerCase() as keyof HTMLElementEventMap, oldProps[attr] as EventListener);
      continue;
    }
    if (attr === "className") {
      target.removeAttribute("class");
      continue;
    }

    target.removeAttribute(attr);
  }
}

export function updateElement(parent?: Element, newNode?: NormalizeVNodeType, oldNode?: NormalizeVNodeType, index = 0) {
  // 1. 노드 제거 (newNode가 없고 oldNode가 있는 경우)
  if (!newNode && oldNode) {
    const childNode = parent?.childNodes[index];

    if (!childNode) {
      return;
    }

    parent?.removeChild(childNode);
    return;
  }

  // 2. 새 노드 추가 (newNode가 있고 oldNode가 없는 경우)
  if (!oldNode && newNode) {
    parent?.appendChild(createElement(newNode));
    return;
  }

  // 3. 텍스트 노드 업데이트
  if (typeof newNode === "string" || typeof newNode === "number") {
    if (newNode === oldNode) {
      return;
    }

    parent?.replaceChild(document.createTextNode(newNode.toString()), parent?.childNodes[index]);
    return;
  }

  if (
    typeof newNode === "object" &&
    typeof oldNode === "object" &&
    newNode !== null &&
    oldNode !== null &&
    "type" in newNode &&
    "type" in oldNode &&
    (newNode as any).type !== (oldNode as any).type
  ) {
    parent?.replaceChild(createElement(newNode), parent?.childNodes[index]);
    return;
  }

  // 5. 같은 타입의 노드 업데이트
  // - 속성 업데이트
  const element = parent?.childNodes[index] as HTMLElement;
  const newProps = typeof newNode === "object" && newNode !== null && "props" in newNode ? (newNode as any).props : {};
  const oldProps = typeof oldNode === "object" && oldNode !== null && "props" in oldNode ? (oldNode as any).props : {};
  updateAttributes(element, newProps, oldProps);

  // 6. newNode와 oldNode의 모든 자식 태그를 순회하며 1 ~ 5의 내용을 반복한다.
  const newChildren =
    typeof newNode === "object" && newNode !== null && "children" in newNode ? (newNode as any).children : [];
  const oldChildren =
    typeof oldNode === "object" && oldNode !== null && "children" in oldNode ? (oldNode as any).children : [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  for (let i = maxLength - 1; i >= newChildren.length; i--) {
    if (oldChildren[i]) {
      updateElement(element, undefined, oldChildren[i], i);
    }
  }

  for (let i = 0; i < newChildren.length; i++) {
    updateElement(element, newChildren[i], oldChildren[i], i);
  }
}
