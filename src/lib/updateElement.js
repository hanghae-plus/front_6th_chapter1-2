import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

// 모든 태그를 비교하여 변경된 부분 수정
// Node = { type, props, children: children.flat() }
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const target = parentElement.childNodes[index];

  // oldNode만 있거나 newNode만 있는 경우
  if (!newNode && oldNode) {
    if (parentElement.childNodes[index]) {
      parentElement.removeChild(parentElement.childNodes[index]);
    }
    return;
  }
  if (newNode && !oldNode) return parentElement.appendChild(createElement(newNode));

  // text인 경우
  if (
    (typeof newNode === "string" || typeof newNode === "number") &&
    (typeof oldNode === "string" || typeof oldNode === "number")
  ) {
    if (newNode === oldNode) return;
    return parentElement.replaceChild(createElement(newNode), target);
  }

  // 둘 중 하나라도 object가 아닌 경우
  if (typeof newNode !== "object" || typeof oldNode !== "object") {
    return parentElement.replaceChild(createElement(newNode), target);
  }

  // oldNode와 newNode의 type이 다른 경우
  if (newNode.type !== oldNode.type || typeof newNode !== typeof oldNode) {
    return parentElement.replaceChild(createElement(newNode), target);
  }

  // oldNode와 newNode의 태그가 같은 경우
  updateAttributes(target, newNode.props ?? {}, oldNode.props ?? {});

  const newChildren = newNode.children ?? [];
  const oldChildren = oldNode.children ?? [];

  for (let i = 0; i < Math.min(newChildren.length, oldChildren.length); i++) {
    updateElement(target, newChildren[i], oldChildren[i], i);
  }

  // newChildren 더 많으면 추가
  for (let i = oldChildren.length; i < newChildren.length; i++) {
    target.appendChild(createElement(newChildren[i]));
  }

  // oldChildren 더 많으면 역순으로 삭제
  for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
    const child = target.childNodes[i];
    if (child) target.removeChild(child);
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
      if (attr in target) {
        // target에 attr가 존재하는지 확인
        target[attr] = value; // 있으면 직접 업데이트
        if (!value) {
          // attr가 존재하는데 값이 false
          // 해당 attr 삭제
          target.removeAttribute(attr);
        }
      } else {
        // attr가 존재하지 않음
        // true이면 빈 문자열로 추가, false이면 제거
        value ? target.setAttribute(attr, "") : target.removeAttribute(attr);
      }
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
