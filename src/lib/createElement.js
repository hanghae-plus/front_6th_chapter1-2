import { addEvent } from "./eventManager";

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

  setAttributes($el, vNode.props);

  if (vNode.children) {
    vNode.children.forEach((child) => {
      const childElement = createElement(child);
      $el.append(childElement);
    });
  }

  return $el;
}

function setAttributes($el, props) {
  if (props) {
    for (let attribute in props) {
      if (attribute === "children") continue;

      if (attribute.startsWith("on") && typeof props[attribute] === "function") {
        const eventType = attribute.slice(2).toLowerCase();
        addEvent($el, eventType, props[attribute]);
      } else if (attribute === "className") {
        $el.setAttribute("class", props[attribute]);
      } else if (typeof props[attribute] === "boolean") {
        console.log("attribute", attribute, props[attribute]);
        // boolean property는 직접 설정
        $el[attribute] = props[attribute];
        // false인 경우 DOM attribute 제거
        if (!props[attribute]) {
          $el.removeAttribute(attribute);
        } else {
          $el.setAttribute(attribute);
        }
        console.log("attribute", attribute, $el[attribute]);
      } else {
        $el.setAttribute(attribute, props[attribute]);
      }
    }
  }
}
