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

  if (typeof vNode === "object" && typeof vNode.type === "function") {
    throw new Error(
      "컴포넌트는 createElement로 처리할 수 없습니다. 정규화 후 createElement를 사용해주세요.",
    );
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
    if (key === "style") {
      // 기존 스타일은 유지하면서 새로운 스타일만 추가/덮어쓰기
      Object.assign($el.style, value);
      return;
    }

    // checked, disabled, selected, readOnly인 경우
    if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
      $el[key] = value;

      if (!value) {
        $el.removeAttribute(key);
      }

      return;
    }

    // vNode 객체는 HTML 속성으로 설정하지 않음
    if (value && typeof value === "object" && (value.type || value.children)) {
      return;
    }

    $el.setAttribute(key, value);
  });
}
