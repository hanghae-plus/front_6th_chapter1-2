import { addEvent } from "./eventManager";

// 브라우저 표준 이벤트 목록
const knownDomEvents = new Set([
  "click",
  "dblclick",
  "mousedown",
  "mouseup",
  "mouseover",
  "mouseout",
  "mousemove",
  "mouseenter",
  "mouseleave",
  "keydown",
  "keyup",
  "keypress",
  "focus",
  "blur",
  "change",
  "input",
  "submit",
  "contextmenu",
  "wheel",
  "scroll",
  "resize",
  "touchstart",
  "touchend",
  "touchmove",
  "touchcancel",
]);

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
      if (element instanceof Node) fragment.appendChild(element);
    });
    return fragment;
  }

  if (typeof vNode === "object") {
    if (typeof vNode.type === "function") {
      throw new Error("컴포넌트로 엘리먼트를 생성할 수 없음");
    }

    // DOM 요소 생성
    const element = document.createElement(vNode.type);

    // props 처리
    if (vNode.props) {
      Object.entries(vNode.props).forEach(([key, value]) => {
        // className는 class로 변경
        if (key === "className") {
          element.setAttribute("class", value);
        }
        // 이벤트 핸들러는 이벤트 위임 방식으로 등록
        else if (key.startsWith("on") && typeof value === "function") {
          const eventType = key.slice(2).toLowerCase();
          if (knownDomEvents.has(eventType)) {
            addEvent(element, eventType, value);
          }
        } else if (typeof value === "boolean") {
          element[key] = value;
        } else {
          // 나머지는 그대로 설정
          element.setAttribute(key, value);
        }
      });
    }

    // children 처리
    vNode.children?.forEach((child) => {
      // 재귀적으로 돌아가도록 createElement를 자식에도 실행
      const childElement = createElement(child);
      if (childElement) element.appendChild(childElement);
    });

    return element;
  }
  return vNode;
}

// function updateAttributes($el, props) {}
