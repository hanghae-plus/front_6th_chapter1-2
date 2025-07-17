import { addEvent } from "./eventManager";

/**
 * Virtual DOM 노드를 실제 DOM 엘리먼트로 변환하는 함수
 * @param {any} vNode - 변환할 Virtual DOM 노드
 * @returns {HTMLElement|Text|DocumentFragment} 실제 DOM 노드
 */
export function createElement(vNode) {
  // vNode가 null, undefined, boolean이면 빈 텍스트 노드 반환
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode(""); // 빈 텍스트 노드 생성
  }

  // vNode가 문자열 또는 숫자면 텍스트 노드로 변환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode); // 실제 텍스트 노드 생성
  }

  // vNode가 배열이면 DocumentFragment에 각 자식 노드 추가
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment(); // 여러 노드를 담을 수 있는 가상 컨테이너 생성
    vNode.forEach((child) => fragment.appendChild(createElement(child))); // 각 자식 vNode를 재귀적으로 DOM으로 변환 후 추가
    return fragment; // 완성된 fragment 반환
  }

  // vNode가 객체이고 type 속성이 있으면 실제 DOM 엘리먼트 생성
  if (typeof vNode === "object" && vNode.type) {
    const $el = document.createElement(vNode.type); // type에 해당하는 태그 생성

    if (vNode.props) {
      updateAttributes($el, vNode.props); // props가 있으면 속성/이벤트 바인딩
    }

    if (vNode.children) {
      vNode.children.forEach((child) => {
        $el.appendChild(createElement(child)); // 자식 vNode들을 재귀적으로 DOM으로 변환 후 추가
      });
    }

    return $el; // 완성된 DOM 엘리먼트 반환
  }
}

/**
 * 실제 DOM 엘리먼트에 속성과 이벤트를 바인딩하는 함수
 * @param {HTMLElement} $el - 속성을 설정할 DOM 엘리먼트
 * @param {Object} props - 설정할 속성과 이벤트 핸들러를 담은 객체
 */
function updateAttributes($el, props) {
  for (const [attr, value] of Object.entries(props)) {
    // on으로 시작하면 이벤트로 간주
    if (attr.startsWith("on")) {
      const eventType = attr.substring(2).toLowerCase(); // onClick → click 등으로 변환
      addEvent($el, eventType, value); // 이벤트 바인딩
    } else if (attr === "className") {
      // className은 class 속성으로 변환
      value ? $el.setAttribute("class", value) : $el.removeAttribute("class");
    } else if (attr === "style" && typeof value === "object") {
      // style이 객체면 그대로 style 속성에 할당 (문자열이어야 정상 동작)
      $el.setAttribute("style", value);
    } else if (["checked", "disabled", "readOnly", "selected"].includes(attr)) {
      // boolean 속성은 직접 프로퍼티로 할당
      $el[attr] = Boolean(value);
    } else {
      // 그 외 속성은 모두 setAttribute로 처리
      $el.setAttribute(attr, value);
    }
  }
}
