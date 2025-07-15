import { createElement } from "./createElement.js";
import { addEvent, removeEvent } from "./eventManager";

function updateAttributes(target, originNewProps, originOldProps) {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  // 이전 속성 제거
  Object.keys(oldProps).forEach((key) => {
    if (key.startsWith("on") && typeof oldProps[key] === "function") {
      const eventType = key.slice(2).toLowerCase();
      removeEvent(target, eventType, oldProps[key]);
      return;
    }

    if (!(key in newProps)) {
      if (key === "className") {
        target.removeAttribute("class");
      } else if (key === "style") {
        target.style = "";
      } else {
        target.removeAttribute(key);
      }
    }
  });

  // 새로운 속성 추가/업데이트
  Object.entries(newProps).forEach(([key, value]) => {
    if (oldProps[key] === value) return;

    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      if (oldProps[key]) {
        removeEvent(target, eventType, oldProps[key]);
      }
      addEvent(target, eventType, value);
      return;
    }

    if (key === "className") {
      if (value) {
        target.setAttribute("class", value);
      } else {
        target.removeAttribute("class");
      }
      target.removeAttribute("classname");
      return;
    }

    if (key === "style") {
      Object.assign(target.style, value);
      return;
    }

    if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
      target[key] = value;
      if (!value) {
        target.removeAttribute(key);
      }
      return;
    }

    target.setAttribute(key, value);
  });
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 제거된 경우
  if (!newNode && oldNode) {
    parentElement.removeChild(parentElement.childNodes[index]);
    return;
  }

  // 추가된 경우
  if (newNode && !oldNode) {
    const newElement = createElement(newNode);
    parentElement.appendChild(newElement);
    return;
  }

  // 기존 노드와 새로운 노드 모두 문자열일 때
  if (
    newNode &&
    oldNode &&
    newNode.type === "string" &&
    newNode.type === oldNode.type
  ) {
    // children이 변경된 경우 textContent를 변경한다.
    if (newNode.props.children !== oldNode.props.children) {
      parentElement.childNodes[index].textContent = newNode;
      return;
    }
  }

  // 타입이 변경된 경우 교체한다.
  if (newNode && oldNode && newNode.type !== oldNode.type) {
    const newElement = createElement(newNode);
    parentElement.replaceChild(newElement, parentElement.childNodes[index]);
    return;
  }

  // 타입이 같을 때 속성을 업데이트한다.
  if (newNode && oldNode && newNode.type === oldNode.type) {
    const oldElement = parentElement.childNodes[index];
    updateAttributes(oldElement, newNode.props, oldNode.props);

    if (newNode.children) {
      newNode.children.forEach((child, i) => {
        updateElement(oldElement, child, oldNode.children[i], i);
      });
    }
    return;
  }
}
