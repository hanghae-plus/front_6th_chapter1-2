import { addEvent } from "./eventManager";

/**
 * 가상 DOM 노드를 실제 DOM 요소로 변환하는 함수입니다.
 *
 * @param {*} vNode - 변환할 가상 DOM 노드
 * @param {string} [vNode.type] - DOM 요소의 타입 (예: 'div', 'span' 등)
 * @param {Object} [vNode.props] - DOM 요소의 속성들
 * @param {string} [vNode.props.className] - 요소의 클래스 이름
 * @param {boolean} [vNode.props.selected] - option 요소의 선택 상태
 * @param {boolean} [vNode.props.checked] - 체크박스/라디오 버튼의 체크 상태
 * @param {boolean} [vNode.props.disabled] - 요소의 비활성화 상태
 * @param {boolean} [vNode.props.readOnly] - 요소의 읽기 전용 상태
 * @param {Array} [vNode.children] - 자식 노드들
 * @returns {Node} 생성된 DOM 노드
 */
export function createElement(vNode) {
  // null, undefined, boolean 처리
  if (vNode == null || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 문자열이나 숫자 처리
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  // 배열 처리
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      if (child != null) {
        const element = createElement(child);
        fragment.appendChild(element);
      }
    });
    return fragment;
  }

  // DOM 엘리먼트 생성
  const $el = document.createElement(vNode.type);

  // 속성 설정
  if (vNode.props) {
    Object.entries(vNode.props).forEach(([name, value]) => {
      // 이벤트 리스너
      if (name.startsWith("on")) {
        const eventType = name.toLowerCase().substring(2);
        addEvent($el, eventType, value);
        return;
      }

      // className 특별 처리
      if (name === "className") {
        $el.className = value;
        return;
      }

      // select와 option 요소의 특별 처리
      if (name === "selected" && $el.tagName === "OPTION") {
        $el.selected = !!value;
        return;
      }

      // boolean 속성 특별 처리
      if (name === "checked" || name === "disabled" || name === "readOnly") {
        $el[name] = !!value;
        if (value) {
          $el.setAttribute(name, "");
        }
        return;
      }

      // 일반 속성 처리
      if (value !== false && value != null) {
        $el.setAttribute(name, value);
      }
    });
  }

  // 자식 요소 처리
  if (vNode.children) {
    vNode.children.forEach((child) => {
      if (child != null) {
        const childElement = createElement(child);
        $el.appendChild(childElement);
      }
    });
  }

  return $el;
}
