import { addEvent } from "./eventManager";

export function createElement(vNode) {
  console.log("createElement vNode : ", vNode);
  if (vNode === undefined || vNode === null || typeof vNode === "boolean") {
    return document.createTextNode("");
  }
  if (typeof vNode === "string" || typeof vNode === "number") {
    console.log("textNode : ", document.createTextNode(vNode.toString()));
    return document.createTextNode(vNode.toString());
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((node) => {
      const element = document.createElement(node.type);
      // TODO: 여기 children이나 props 처리는 필요없나?? 확인해보기
      if (element instanceof Node) fragment.appendChild(element);
    });
    return fragment;
  }

  if (typeof vNode === "object") {
    if (typeof vNode.type === "function") {
      throw new Error("컴포넌트로 엘리먼트를 생성할 수 없음");
    }
    const element = document.createElement(vNode.type);

    // props 처리
    if (vNode.props) {
      Object.entries(vNode.props).forEach(([key, value]) => {
        if (key.startsWith("on") && typeof value === "function") {
          // 이벤트 핸들러
          addEvent(element, key.slice(2).toLowerCase(), value);
        } else if (key === "className") {
          element.setAttribute("class", value);
        } else if (key.startsWith("data-")) {
          element.setAttribute(key, value);
        } else if (typeof value === "boolean") {
          if (value) element.setAttribute(key, "");
        } else {
          element.setAttribute(key, value);
        }
      });
    }

    // children 처리
    vNode.children?.forEach((child) => {
      const childEl = createElement(child);
      if (childEl) element.appendChild(childEl);
    });

    return element;
  }
  return vNode;
}

// function updateAttributes($el, props) {}
