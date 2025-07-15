import { addEvent } from "./eventManager";

export function createElement(vNode) {
  // falsy한 값을 텍스트노드로 처리
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 문자열이나 숫자를 텍스트노드로 처리
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode);
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => fragment.appendChild(createElement(child)));
    return fragment;
  }

  if (typeof vNode === "object" && vNode.type) {
    const $el = document.createElement(vNode.type);

    if (vNode.props) {
      updateAttributes($el, vNode.props);
    }

    if (vNode.children) {
      vNode.children.forEach((child) => {
        $el.appendChild(createElement(child));
      });
    }

    return $el;
  }
}

function updateAttributes($el, props) {
  for (const [attr, value] of Object.entries(props)) {
    if (attr.startsWith("on")) {
      const eventType = attr.substring(2).toLowerCase();
      addEvent($el, eventType, value);
    } else if (attr === "className") {
      value ? $el.setAttribute("class", value) : $el.removeAttribute("class");
    } else if (attr === "style" && typeof value === "object") {
      $el.setAttribute("style", value);
    } else if (["checked", "disabled", "readOnly", "selected"].includes(attr)) {
      $el[attr] = Boolean(value);
    } else {
      $el.setAttribute(attr, value);
    }
  }
}
