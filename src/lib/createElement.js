import { addEvent } from "./eventManager";

/**
 * DOM 요소에 속성을 설정하는 함수
 * @param {HTMLElement} $el - 속성을 설정할 DOM 요소
 * @param {Object|null} props - 설정할 속성들
 */

// 이 파일은 정규화된 Virtual DOM 객체를 실제 브라우저의 DOM 요소로 변환하는 역할을 합니다.

// 이 함수는 Virtual DOM의 속성(props)을 실제 DOM 요소에 적용하는 역할을 합니다.
// 기존은 if 문으로 처리했지만, key에 따라 분기하여 switch 문으로 처리하는 방식으로 변경 했습니다.
function updateAttributes($el, props) {
  if (!props) return;
  Object.entries(props).forEach(([key, value]) => {
    // 1. 이벤트 핸들러 처리 (onClick 등)
    // → key가 'on'으로 시작하고 값이 함수인 경우, 이벤트 리스너로 등록
    if (key.startsWith("on") && typeof value === "function") {
      addEvent($el, key.slice(2).toLowerCase(), value);
      return;
    }
    switch (key) {
      // 2. className → class 속성으로 변환
      // → React 스타일의 className을 실제 DOM의 class로 변환
      case "className":
        $el.setAttribute("class", value);
        break;
      // 3. checked, selected → property로만 설정 (attribute는 사용하지 않음)
      // → input, option 등에서 checked/selected는 property로만 관리
      case "checked":
      case "selected":
        $el[key] = value;
        break;
      // 4. disabled, readOnly → property와 attribute 모두 설정
      // → disabled/readOnly는 property와 attribute를 모두 동기화
      case "disabled":
      case "readOnly":
        $el[key] = value;
        if (value) $el.setAttribute(key, "");
        break;
      // 5. 그 외 boolean 속성 → true일 때만 attribute 추가
      // → 기타 boolean 속성은 true일 때만 attribute를 추가
      default:
        if (typeof value === "boolean") {
          if (value) $el.setAttribute(key, "");
        } else {
          // 6. 일반 속성은 attribute로 설정
          // → 나머지 속성은 모두 attribute로 추가
          $el.setAttribute(key, value);
        }
    }
  });
}

/**
 * 정규화된 Virtual DOM 객체를 실제 DOM 요소로 변환
 * @param {any} vNode - 변환할 Virtual DOM 노드
 * @returns {Node} 실제 DOM 노드
 */
export function createElement(vNode) {
  // Falsy 값들은 빈 텍스트 노드로 변환
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 문자열이나 숫자는 텍스트 노드로 변환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  // 배열이면 DocumentFragment로 변환
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });
    return fragment;
  }

  // 함수형 컴포넌트는 에러 발생 (정규화가 필요함)
  if (typeof vNode.type === "function") {
    throw new Error("컴포넌트는 createElement로 직접 처리할 수 없습니다. normalizeVNode를 먼저 사용하세요.");
  }

  // vNode 객체를 HTML 요소로 변환
  const $el = document.createElement(vNode.type);

  // 속성 설정
  updateAttributes($el, vNode.props);

  // 자식 요소들 추가
  if (vNode.children) {
    vNode.children.forEach((child) => {
      // falsy 값들은 완전히 건너뛰기
      if (child === null || child === undefined || child === false || child === true) {
        return;
      }
      $el.appendChild(createElement(child));
    });
  }

  return $el;
}
