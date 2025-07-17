import { addEvent } from "./eventManager";

export function createElement(vNode) {
  // null, undefined, boolean 값 처리
  if (vNode === null || vNode === undefined || vNode === true || vNode === false) {
    return document.createTextNode("");
  }

  // 문자열과 숫자 처리
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  // 배열 처리 - DocumentFragment 생성
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      const childElement = createElement(child);
      if (childElement) {
        fragment.appendChild(childElement);
      }
    });
    return fragment;
  }

  // vNode 객체가 아닌 경우
  if (!vNode || typeof vNode !== "object" || !vNode.type) {
    return document.createTextNode("");
  }

  // 함수형 컴포넌트 처리 - 오류 발생
  if (typeof vNode.type === "function") {
    throw new Error("Cannot create element from component");
  }

  // 일반 엘리먼트 처리
  const element = document.createElement(vNode.type);

  // 속성 처리
  if (vNode.props) {
    updateAttributes(element, vNode.props);
  }

  // 자식 요소 처리
  if (vNode.children) {
    vNode.children.forEach((child) => {
      const childElement = createElement(child);
      if (childElement) {
        element.appendChild(childElement);
      }
    });
  }

  return element;
}

function updateAttributes($el, props) {
  Object.entries(props).forEach(([key, value]) => {
    if (key === "children") return; // children은 별도 처리

    if (key.startsWith("on") && typeof value === "function") {
      // 이벤트 핸들러는 DOM 속성으로 추가하지 않고 별도로 관리
      const eventName = key.toLowerCase().substring(2);
      addEvent($el, eventName, value);
    } else if (key === "className") {
      // className 처리
      $el.className = value;
    } else if (key.startsWith("data-")) {
      // data 속성 처리
      const dataKey = key.substring(5);
      $el.dataset[dataKey] = value;
    } else if (typeof value === "boolean") {
      // 불리언 속성 처리
      if (value) {
        $el.setAttribute(key, "");
      }
    } else {
      // 일반 속성 처리
      $el.setAttribute(key, value);
    }
  });
}
