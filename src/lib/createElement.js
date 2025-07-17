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

/**
 * 가상DOM을 실제 브라우저 DOM으로 변환하는 함수
 */
export function createElement(vNode) {
  // 조건부 렌더링에서 나올 수 있는 false, null, undefined를 비워진 텍스트 노드로 처리
  if (vNode === undefined || vNode === null || typeof vNode === "boolean") {
    return document.createTextNode("");
  }
  // 문자열 또는 숫자를 텍스트 노드로 변환
  // TODO: 어차피 normalizeVNode에서 숫자도 문자열로 변환했는데 왜 필요하지?
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode.toString());
  }

  // 배열인 경우 DocumentFragment로 묶어서 반환
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((node) => {
      const child = createElement(node);
      if (child instanceof Node) fragment.appendChild(child);
    });
    return fragment;
  }

  // 오브젝트인 경우 분기처리
  if (typeof vNode === "object") {
    // 함수형 컴포넌트는 엘리먼트로 생성 불가하므로 예외처리
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
          // onClick등을 click으로 변환
          const eventType = key.slice(2).toLowerCase();
          // 브라우저 표준 이벤트만 처리
          if (knownDomEvents.has(eventType)) {
            addEvent(element, eventType, value);
          }
        }
        // boolean 속성은 property로 직접 지정
        else if (typeof value === "boolean") {
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
