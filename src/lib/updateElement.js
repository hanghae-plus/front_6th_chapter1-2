import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

// 모든 태그를 비교하여 변경된 부분 수정
// Node = { type, props, children: children.flat() }
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // oldNode만 있거나 newNode만 있는 경우
  if (!newNode && oldNode) parentElement.removeChild(parent.childNode[index]);
  if (newNode && oldNode) parentElement.appendChild(createElement(newNode));

  // 모두 text인 경우
  if (
    (typeof newNode === "string" || typeof newNode === "number") &&
    (typeof oldNode === "string" || typeof oldNode === "number")
  ) {
    if (newNode === oldNode) return;

    return parentElement.replaceChild(createElement(newNode), parentElement.childNodes[index]);
  }

  // oldNode와 newNode의 type이 다른 경우
  if (newNode.type !== oldNode.type) {
    return parent.replaceChild(createElement(newNode), parent.childnodes[index]);
  }

  // oldNode와 newNode의 태그가 같은 경우
  updateAttributes(parentElement.childNodes[index], newNode.props ?? {}, oldNode.props ?? {});

  // 모든 자식 태그를 순회
  const maxLength = Math.max(newNode.chiledren.length, oldNode.children.length);
  for (let i = 0; i < maxLength; i++) {
    updateElement(parent.childNodex[index], newNode.children[i], oldNode.children[i], i);
  }
}

// oldNode와 newNode를 비교하여 변경된 부분만 반영
// target - DOM 요소
// props - type, className, boolean, handler
function updateAttributes(target, originNewProps, originOldProps) {
  // props 업데이트 및 추가
  Object.entries(originNewProps).forEach(([attr, value]) => {
    if (attr === "className") {
      target.setAttribute("class", value);
    } else if (typeof value === "boolean") {
      value ? target.setAttribute(attr, "") : target.removeAttribute(attr);
    } else if (attr.startsWith("on")) {
      const eventType = attr.slice(2).toLowerCase();
      const oldHandler = originOldProps[attr];

      if (oldHandler) {
        // 이벤트를 제거하지 않으면 누적됨
        removeEvent(target, eventType, oldHandler);
      }
      addEvent(target, eventType, value);
    } else {
      target.setAttribute(attr, value);
    }
  });

  // oldProps에는 있지만 newProps에 없으면 삭제
  Object.keys(originOldProps).forEach((attr) => {
    if (!(attr in originNewProps)) {
      if (attr === "className") {
        target.removeAttribute("class");
      } else if (typeof originOldProps[attr] === "boolean") {
        target.removeAttribute(attr);
      } else if (attr.startsWith("on")) {
        const eventType = attr.slice(2).toLowerCase();
        removeEvent(target, eventType, originOldProps[attr]);
      } else {
        target.removeAttribute(attr);
      }
    }
  });
}
