import { addEvent } from "./eventManager";

const booleanAttr = ["checked", "disabled", "readonly", "readOnly", "required", "autofocus", "multiple", "selected"];

export function createElement(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      const el = createElement(child);
      if (el instanceof Node) {
        fragment.appendChild(el);
      }
    });
    return fragment;
  }

  // 함수형 컴포넌트일 때
  if (typeof vNode === "object" && typeof vNode.type === "string") {
    // console.log("여기니?", vNode);
    const tag = document.createElement(vNode.type);
    const props = vNode.props || {};
    updateAttributes(tag, props);
    const children = vNode.children || [];

    const childrenArray = Array.isArray(children) ? children : [];
    childrenArray.forEach((child) => {
      const el = createElement(child);
      if (el instanceof Node) {
        tag.appendChild(el);
      }
    });
    return tag;
  }

  if (typeof vNode === "object" && typeof vNode.type === "function") {
    throw new Error("컴포넌트를 createElement로 처리할 수 없습니다");
  }

  throw new Error("컴포넌트를 createElement로 처리할 수 없습니다");
}

function updateAttributes($el, props) {
  if (!props) return;

  for (const [key, value] of Object.entries(props)) {
    if (key === "children") continue;

    if (key.startsWith("on") && typeof value === "function") {
      // 이벤트 처리 - 위임 방식으로 처리하므로 DOM 속성으로 설정하지 않음
      const eventType = key.slice(2).toLowerCase();
      addEvent($el, eventType, value);
      continue;
    }

    if (key === "style") {
      Object.assign($el.style, value);
    }

    if (key === "className") {
      $el.setAttribute("class", value);
      continue;
    }

    if (booleanAttr.includes(key)) {
      $el[key] = !!value;
      continue;
    }

    if (typeof value === "boolean") {
      if (value) {
        $el.setAttribute(key, "");
      } else {
        $el.removeAttribute(key);
      }
      continue;
    }

    // 일반 속성들 (type, id 등)
    $el.setAttribute(key, value);
  }
}
