import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

// 모든 태그를 비교하여 변경된 부분 수정
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const target = parentElement.childNodes[index];

  // oldNode는 있는데 newNode는 없는 경우 요소 제거
  if (!newNode && oldNode) {
    if (target) parentElement.removeChild(target);
    return;
  }
  // newNode는 있는데 oldNode는 없는 경우 요소 추가
  if (newNode && !oldNode) return parentElement.appendChild(createElement(newNode));

  // 문자열이거나 숫자인 경우 교체
  if (
    (typeof newNode === "string" || typeof newNode === "number") &&
    (typeof oldNode === "string" || typeof oldNode === "number")
  ) {
    if (newNode === oldNode) return;
    return parentElement.replaceChild(createElement(newNode), target);
  }

  // 둘 중 하나라도 객체(VNode)가 아닌 경우 교체
  if (typeof newNode !== "object" || typeof oldNode !== "object") {
    return parentElement.replaceChild(createElement(newNode), target);
  }

  // oldNode와 newNode의 type이 다른 경우 교체
  if (newNode.type !== oldNode.type || typeof newNode !== typeof oldNode) {
    return parentElement.replaceChild(createElement(newNode), target);
  }

  // oldNode와 newNode의 태그가 같으면 속성 업데이트
  updateAttributes(target, newNode.props ?? {}, oldNode.props ?? {});

  const newChildren = newNode.children ?? [];
  const oldChildren = oldNode.children ?? [];

  // 공통 길이까지 자식 요소를 비교하며 요소 업데이트
  for (let i = 0; i < Math.min(newChildren.length, oldChildren.length); i++) {
    updateElement(target, newChildren[i], oldChildren[i], i);
  }

  // newChildren가 더 많으면 추가
  for (let i = oldChildren.length; i < newChildren.length; i++) {
    target.appendChild(createElement(newChildren[i]));
  }

  // oldChildren가 더 많으면 역순으로 삭제
  for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
    const child = target.childNodes[i];
    if (child) target.removeChild(child);
  }
}

// oldNode와 newNode를 비교하여 변경된 부분만 반영
function updateAttributes(target, originNewProps, originOldProps) {
  // props 업데이트 및 추가
  Object.entries(originNewProps).forEach(([attr, value]) => {
    if (attr === "className") {
      // class 속성 업데이트
      target.setAttribute("class", value);
    } else if (typeof value === "boolean") {
      // boolean 속성 업데이트
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
        // true일 때 빈 문자열로 속성 추가
        value && target.setAttribute(attr, "");
      }
    } else if (attr.startsWith("on")) {
      // 이벤트 업데이트
      const eventType = attr.slice(2).toLowerCase();
      const oldHandler = originOldProps[attr];

      if (oldHandler) {
        // 누적 방지를 위한 이벤트 제거
        removeEvent(target, eventType, oldHandler);
      }
      addEvent(target, eventType, value);
    } else {
      // 일반 속성 업데이트
      target.setAttribute(attr, value);
    }
  });

  // oldProps에는 있지만 newProps에 없으면 삭제
  Object.keys(originOldProps).forEach((attr) => {
    if (!(attr in originNewProps)) {
      if (attr === "className") {
        // class 속성 제거
        target.removeAttribute("class");
      } else if (typeof originOldProps[attr] === "boolean") {
        // boolean 속성 제거
        target.removeAttribute(attr);
      } else if (attr.startsWith("on")) {
        // 이벤트 제거
        const eventType = attr.slice(2).toLowerCase();
        removeEvent(target, eventType, originOldProps[attr]);
      } else {
        // 일반 속성 제거
        target.removeAttribute(attr);
      }
    }
  });
}
