import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

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
      target.setAttribute(key, value);
      if (!value) {
        target.removeAttribute(key);
      }
      return;
    }

    target.setAttribute(key, value);
  });
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (!newNode && oldNode) {
    parentElement.removeChild(parentElement.childNodes[index]);
    return;
  }

  if (newNode && !oldNode) {
    const newElement = createElement(newNode);
    parentElement.appendChild(newElement);
    return;
  }

  if (
    newNode &&
    oldNode &&
    newNode.type === "string" &&
    newNode.type === oldNode.type
  ) {
    if (newNode.props.children !== oldNode.props.children) {
      parentElement.childNodes[index].textContent = newNode;
      return;
    }
  }

  if (newNode && oldNode && newNode.type !== oldNode.type) {
    const newElement = createElement(newNode);
    parentElement.replaceChild(newElement, parentElement.childNodes[index]);
    return;
  }

  if (newNode && oldNode && newNode.type === oldNode.type) {
    const newElement = createElement(newNode);
    const oldElement = parentElement.childNodes[index];
    updateAttributes(oldElement, newNode.props, oldNode.props);

    oldElement.replaceWith(newElement);

    newNode.children.forEach((child, i) => {
      updateElement(oldElement, child, oldNode.children[i], i);
    });
    return;
  }
}
