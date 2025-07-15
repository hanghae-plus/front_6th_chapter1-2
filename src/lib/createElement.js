// import { addEvent } from "./eventManager";

export function createElement(vNode) {
  if (vNode === undefined || vNode === null || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      const childElement = createElement(child); // 재귀 호출
      fragment.appendChild(childElement);
    });
    return fragment;
  }

  // 컴포넌트 타입인 경우 에러
  if (typeof vNode.type === "function") {
    throw new Error("vNode is not an object");
  }

  const $el = document.createElement(vNode.type);

  if (vNode.props) {
    for (let i in vNode.props) {
      if (i === "className") {
        $el.className = vNode.props[i];
      } else {
        $el.setAttribute(i, vNode.props[i]);
      }
    }
  }
  // console.log($children);
  if (vNode.children) {
    vNode.children.forEach((child) => {
      const childElement = createElement(child);
      $el.append(childElement);
    });
  }

  return $el;
}

// function updateAttributes($el, props) {}
