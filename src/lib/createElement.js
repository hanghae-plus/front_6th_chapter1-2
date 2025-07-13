import { addEvent } from "./eventManager";

// VirtualDOM을 RealDOM으로 변환
// vNode = { type, props, children: children.flat() }
export function createElement(vNode) {
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode);
  }

  const $el = document.createElement(vNode.type);
  updateAttributes($el, vNode.props ?? {});

  const children = vNode.children.map(createElement);
  children.map((child) => $el.appendChild(child));

  return $el;
}

// 새 DOM 노드에 속성 세팅
// props - type, className, boolean, handler
function updateAttributes($el, props) {
  Object.entries(props).forEach(([attr, value]) => {
    if (attr === "className") {
      $el.setAttribute("class", value);
    } else if (typeof value === "boolean") {
      value && $el.setAttribute(attr, "");
    } else if (attr.startsWith("on")) {
      const eventType = attr.slice(2).toLowerCase();
      addEvent($el, eventType, value);
    } else {
      $el.setAttribute(attr, value);
    }
  });
}
