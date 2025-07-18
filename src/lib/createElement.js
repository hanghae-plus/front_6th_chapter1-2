import { addEvent } from "./eventManager";

/**
 * vNode를 실제 DOM element로 변환
 * @param {*} vNode - 변환할 vNode
 * @returns {Node} 생성된 DOM 노드
 */
export function createElement(vNode) {
  // 1. null, undefined, boolean -> 빈 텍스트 노드
  if (vNode == null || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 2. 문자열, 숫자 -> 텍스트 노드
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  // 3. 배열 -> DocumentFragment
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      const childElement = createElement(child);
      fragment.appendChild(childElement);
    });
    return fragment;
  }

  // 4. 함수 -> 에러 발생
  if (typeof vNode.type === "function") {
    throw new Error("함수 컴포넌트는 정규화 후에 createElement를 호출해야 합니다.");
  }

  // 5. vNode 객체 -> DOM element 생성
  const element = document.createElement(vNode.type);

  // 속성 설정
  if (vNode.props) {
    updateAttributes(element, vNode.props);
  }

  // 자식 element 추가
  if (vNode.children) {
    vNode.children.forEach((child) => {
      const childElement = createElement(child);
      element.appendChild(childElement);
    });
  }

  return element;
}

/**
 * DOM element에 속성(props) 설정
 * @param {HTMLElement} $el - 대상 DOM element
 * @param {Object} props - 설정할 속성들
 */
function updateAttributes($el, props) {
  Object.entries(props).forEach(([key, value]) => {
    // 1. 이벤트 핸들러
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase(); // onClick -> click
      addEvent($el, eventType, value);
      return;
    }

    // 2. className
    if (key === "className") {
      if (value) {
        $el.setAttribute("class", value);
      } else {
        $el.removeAttribute("class");
      }
      return;
    }

    // 3. style 객체
    if (key === "style" && typeof value === "object" && value !== null) {
      Object.assign($el.style, value);
      return;
    }

    // 4. Boolean 속성 (checked, disabled, selected, readOnly)
    if (typeof value === "boolean") {
      if (key === "checked" || key === "selected") {
        // JavaScript 속성만 사용 (true/false 모두 처리)
        $el[key] = value;
      } else if (key === "readOnly") {
        // readOnly → readonly 변환
        if (value) {
          $el.setAttribute("readonly", "");
          $el.readOnly = true;
        } else {
          $el.removeAttribute("readonly");
          $el.readOnly = false;
        }
      } else {
        // 일반 Boolean 속성 (disabled, hidden 등)
        if (value) {
          $el.setAttribute(key, "");
          if (key in $el) {
            $el[key] = true;
          }
        } else {
          $el.removeAttribute(key);
          if (key in $el) {
            $el[key] = false;
          }
        }
      }
      return;
    }

    // 5. 일반 속성
    if (value != null) {
      $el.setAttribute(key, value);
    }
  });
}
