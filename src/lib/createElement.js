function flatten(arr) {
  return arr.reduce((acc, val) => (Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val)), []);
}

import { addEvent } from "./eventManager";

export function createElement(vNode) {
  if (vNode === undefined || vNode === null || vNode === false || vNode === true) {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    flatten(vNode).forEach((child) => {
      if (child === null || child === undefined || child === false || child === true) return;
      fragment.appendChild(createElement(child));
    });
    return fragment;
  }

  if (typeof vNode === "object" && typeof vNode.type === "string") {
    const el = document.createElement(vNode.type);
    const { props = {}, children = [] } = vNode;

    // props 처리
    Object.entries(props || {}).forEach(([key, value]) => {
      if (key === "checked" || key === "disabled" || key === "selected" || key === "readOnly") {
        el[key] = !!value;
        return;
      }
      if (key.startsWith("on") && typeof value === "function") {
        // 이벤트 핸들러는 setAttribute 하지 않고, addEvent로만 등록
        addEvent(el, key.slice(2).toLowerCase(), value);
      } else if (key === "className") {
        el.setAttribute("class", value);
      } else if (key.startsWith("data-")) {
        el.setAttribute(key, value);
      } else if (typeof value === "boolean") {
        if (value) el.setAttribute(key, "");
        else {
          el.removeAttribute(key);
          if (el.getAttribute(key) === "") {
            el.removeAttribute(key);
          }
        }
      } else {
        el.setAttribute(key, value);
      }
    });

    // children 처리 (평탄화)
    const normalizedChildren = flatten(Array.isArray(children) ? children : [children]);
    normalizedChildren.forEach((child) => {
      if (child === null || child === undefined || child === false || child === true) return;
      el.appendChild(createElement(child));
    });

    return el;
  }

  if (typeof vNode.type === "function") {
    throw new Error("함수형 컴포넌트는 지원하지 않습니다.");
  }

  throw new Error("지원하지 않는 vnode 형식입니다.");
}
