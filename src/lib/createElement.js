import { addEvent } from "./eventManager";

/**
 * 실제 DOM 요소를 생성하는 함수
 *
 * @param {any} vNode 가상 노드
 * @returns {HTMLElement | Text} 실제 DOM 요소
 * @throws {Error} 함수형 컴포넌트는 createElement로 처리할 수 없습니다.
 */
export function createElement(vNode) {
  // 함수형 컴포넌트는 처리할 수 없음
  if (typeof vNode === "function") {
    throw new Error("함수형 컴포넌트는 createElement로 처리할 수 없습니다.");
  }

  // 1. null, undefined, boolean은 빈 텍스트 노드 반환
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 2. vNode가 문자열이나 숫자면 텍스트 노드를 생성하여 반환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode.toString());
  }

  // 3. vNode가 배열인 경우
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    appendChildren(fragment, vNode);

    return fragment;
  }

  // 4. 실제 DOM 요소 생성
  const el = document.createElement(vNode.type);
  const props = vNode.props ?? {};

  updateAttributes(el, props);
  appendChildren(el, vNode.children);

  return el;
}

/**
 * 속성을 업데이트하는 함수
 *
 * @param {HTMLElement} $el 대상 요소
 * @param {object} props 속성 객체
 */
const BOOLEAN_PROPS = ["checked", "disabled", "selected", "readOnly"];
function updateAttributes($el, props) {
  for (const [key, value] of Object.entries(props)) {
    // 스타일 속성 처리
    if (key === "className") {
      if (value) {
        $el.setAttribute("class", value);
      } else {
        $el.removeAttribute("class");
      }
      continue;
    }

    // 이벤트 속성 처리
    if (key.startsWith("on")) {
      if (typeof value === "function") {
        addEvent($el, key.slice(2).toLowerCase(), value);
      }
      continue;
    }

    if (BOOLEAN_PROPS.includes(key)) {
      $el[key] = Boolean(value);
      continue;
    }

    // 기타 속성 처리
    $el.setAttribute(key, value);
  }
}

/**
 * 자식 요소를 추가하는 함수
 *
 * @param {HTMLElement} $el 대상 요소
 * @param {any[]} children 자식 요소 배열
 */
function appendChildren($el, children) {
  children.forEach((node) => {
    const childEl = createElement(node);
    $el.appendChild(childEl);
  });
}
