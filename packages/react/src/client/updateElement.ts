import { addEvent, removeEvent } from "./eventManager.ts";
import { createElement } from "./createElement.ts";
import { EventHandler, VNode, VNodeChild, VNodeProps } from "../core/types.ts";

function updateAttributes(target: HTMLElement | null, originNewProps: VNodeProps, originOldProps: VNodeProps): void {
  if (!target) {
    throw new Error("Target element is null or undefined");
  }
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  // 이전 props의 모든 키를 순회
  for (const attr in oldProps) {
    if (!(attr in newProps)) {
      // 새 props에 없는 속성 제거
      if (attr.startsWith("on") && typeof oldProps[attr] === "function") {
        const eventType = attr.toLowerCase().slice(2);
        removeEvent(target, eventType, oldProps[attr] as EventHandler);
      } else {
        if (attr === "className") {
          target.removeAttribute("class");
        } else {
          target.removeAttribute(attr);
        }
      }
    }
  }
  // 새 props의 모든 키를 순회
  for (const attr in newProps) {
    const value = newProps[attr];
    if (oldProps[attr] !== value) {
      if (attr === "className") {
        target.className = value;
      } else if (attr.startsWith("on") && typeof value === "function") {
        const eventType = attr.toLowerCase().slice(2);
        if (typeof oldProps[attr] === "function") {
          removeEvent(target, eventType, oldProps[attr] as EventHandler);
        }
        addEvent(target, eventType, value as EventHandler);
      } else if (attr === "style" && typeof value === "object") {
        Object.assign(target.style, value);
      } else if (typeof value === "boolean") {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        target[attr] = value;
      } else {
        target.setAttribute(attr, value);
      }
    }
  }
}

export function updateElement(
  parentElement: Element,
  newNode?: VNodeChild,
  oldNode?: VNodeChild,
  index: number = 0,
): void {
  if (!newNode && oldNode) {
    parentElement.removeChild(parentElement.childNodes[index]);
    return;
  }

  if (newNode && !oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  if (typeof newNode === "string" || typeof newNode === "number") {
    if (newNode !== oldNode) {
      const newTextNode = document.createTextNode(String(newNode));
      parentElement.replaceChild(newTextNode, parentElement.childNodes[index]);
    }
    return;
  }

  const newVNode = newNode as VNode;
  const oldVNode = oldNode as VNode;

  if (newVNode.type !== oldVNode.type) {
    parentElement.replaceChild(createElement(newNode), parentElement.childNodes[index]);
    return;
  }

  const target = parentElement.childNodes[index] as HTMLElement;

  updateAttributes(target, newVNode.props || {}, oldVNode.props || {});

  const newChildren = newVNode.children || [];
  const oldChildren = oldVNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  for (let i = maxLength - 1; i >= newChildren.length; i--) {
    if (oldChildren[i]) {
      updateElement(target, undefined, oldChildren[i], i);
    }
  }

  // 그 다음 나머지 업데이트 수행
  for (let i = 0; i < newChildren.length; i++) {
    updateElement(target, newChildren[i], oldChildren[i], i);
  }
}
