import { addEvent } from "./eventManager";

/**
 * @param {object} vNode { type, props, children }
 * @returns {Node} { nodeType, textContent}
 */
export function createElement(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode.toString());
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();

    vNode.forEach((node) => {
      fragment.appendChild(createElement(node));
    });

    return fragment;
  }

  const element = document.createElement(vNode.type);
  const { props, children } = vNode;

  updateAttributes(element, props ?? {});
  children.forEach((child) => element.appendChild(createElement(child)));

  return element;
}

/**
 * 속성 업데이트
 * @param {*} $el { HTMLElement }
 * @param {*} props { ...attributes }
 */
function updateAttributes($el, props) {
  if (!props) {
    return;
  }

  Object.entries(props).forEach(([key, value]) => {
    // 이벤트 핸들러인 경우 (ex. onClick, onMouseOver, etc.)
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      addEvent($el, eventType, value);
      return;
    }

    // className인 경우
    if (key === "className") {
      if (value) {
        $el.setAttribute("class", value);
      } else {
        $el.removeAttribute("class");
      }
      $el.removeAttribute("classname");
      return;
    }

    // style인 경우
    if (key === "style" && typeof value === "object") {
      // 기존 스타일은 유지하면서 새로운 스타일만 추가/덮어쓰기
      Object.assign($el.style, value);
      return;
    }

    // checked, disabled, selected, readOnly인 경우
    if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
      $el[key] = value;
      return;
    }

    $el.setAttribute(key, value);
  });
}
