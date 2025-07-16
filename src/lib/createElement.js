// import { addEvent } from "./eventManager";

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

  if (typeof vNode === "object" && typeof vNode.type === "string") {
    const tag = document.createElement(vNode.type);
    updateAttributes(tag, vNode.props);

    if (Array.isArray(vNode.children)) {
      vNode.children.forEach((child) => {
        const el = createElement(child);
        if (el instanceof Node) {
          tag.appendChild(el);
        }
      });
    }

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

    if (key.startsWith("on")) {
      // 이벤트 처리
    }

    if (key === "style") {
      Object.assign($el.style, value);
    }

    if (key === "className") {
      $el.setAttribute("class", value);
    }

    if (key === "id") {
      $el.setAttribute("id", value);
    }

    if (typeof value === "boolean") {
      if (value) {
        $el.setAttribute(key, "");
        $el[key] = true;
      } else {
        $el.removeAttribute(key);
        $el[key] = false;
      }
      continue;
    }

    if (key.startsWith("data-")) {
      $el.setAttribute(key, value);
    }
  }
}
