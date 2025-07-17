import { addEvent } from "./eventManager";

/**
 * 노드를 생성하는 함수
 * @param {object} vNode - 생성할 노드
 * @returns {HTMLElement} - 생성된 노드
 */
export function createElement(vNode) {
  // 배열인 경우 → DocumentFragment 생성 후 재귀 렌더링
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });
    return fragment;
  }

  // null / undefined / boolean → 빈 텍스트 노드로 변환
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 문자열 또는 숫자 → 텍스트 노드로 변환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode.toString());
  }

  // 일반 엘리먼트 (VNode 형태) → 태그 생성
  if (typeof vNode.type === "string") {
    const el = document.createElement(vNode.type);

    //props 처리
    updateAttributes(el, vNode.props ?? {});

    //자식요소 처리
    (vNode.children || []).forEach((child) => {
      el.appendChild(createElement(child));
    });

    return el;
  }

  // 지원하지 않는 입력은 에러 발생
  throw new Error("지원하지 않는 입력입니다.");
}

/**
 * 요소의 속성(props) 및 이벤트를 설정하는 함수
 * @param {HTMLElement} $el - 속성을 설정할 요소
 * @param {object} props - 설정할 속성들
 */
function updateAttributes($el, props) {
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith("on") && typeof value === "function") {
      // onClick 속성 처리
      const eventType = key.toLowerCase().slice(2); // onClick -> click
      addEvent($el, eventType, value);
    } else if (key === "className") {
      // className 속성 처리 - property로 설정
      $el.setAttribute("class", value);
    } else if (typeof value === "boolean") {
      // 불리언 속성 (예: disabled)
      $el[key] = Boolean(value);
    } else if (key === "style" && typeof value === "object") {
      // style 속성 처리
      Object.assign($el.style, value);
    } else {
      // 일반 속성
      $el.setAttribute(key, value);
    }
  });
}
