// 실제 가상돔에서 직접 돔에 전달받아서 렌더링 하는 함수
import { addEvent } from "./eventManager";

/*
*
1. vNode가 null, undefined, boolean 일 경우, 빈 텍스트 노드를 반환합니다.
2. vNode가 문자열이나 숫자면 텍스트 노드를 생성하여 반환합니다.
3. vNode가 배열이면 DocumentFragment를 생성하고 각 자식에 대해 createElement를 재귀 호출하여 추가합니다.
4. 위 경우가 아니면 실제 DOM 요소를 생성합니다:
    - vNode.type에 해당하는 요소를 생성
    - vNode.props의 속성들을 적용 (이벤트 리스너, className, 일반 속성 등 처리)
    - vNode.children의 각 자식에 대해 createElement를 재귀 호출하여 추가
 * 
 * 
 */

export function createElement(vNode) {
  //1. vNode가 null, undefined, boolean 일 경우, 빈 텍스트 노드를 반환합니다.
  if (shouldRenderAsEmpty(vNode)) {
    // 실제 돔 환경에선 document.createTextNode("") 로 빈 문자열로 바꿔줘야 함
    return document.createTextNode("");
  }
  //2. vNode가 문자열이나 숫자면 텍스트 노드를 생성하여 반환합니다.
  if (isStringOrNumber(vNode)) {
    // 실제 돔 환경에선 document.createTextNode(vNode.toString()) 로 문자열로 바꿔줘야 함
    return document.createTextNode(vNode.toString());
  }

  if (Array.isArray(vNode)) {
    const $el = document.createDocumentFragment();

    vNode.forEach((node) => {
      const childEl = createElement(node);
      return $el.appendChild(childEl);
    });

    return $el;
  }

  const element = document.createElement(vNode.type);

  if (vNode.children) {
    vNode.children.forEach((child) => {
      element.appendChild(createElement(child));
    });
  }

  updateAttributes(element, vNode);
  return element;
}

function shouldRenderAsEmpty(value) {
  return value === false || value === true || value === null || value === undefined;
}

function isStringOrNumber(value) {
  return typeof value === "string" || typeof value === "number";
}

function updateAttributes($el, props) {
  if (props.props) {
    for (const key in props.props) {
      const value = props.props[key];

      if (key === "className") {
        $el.setAttribute("class", props.props["className"]);
      } else if (key.startsWith("on") && typeof value === "function") {
        const eventType = key.slice(2).toLowerCase();
        addEvent($el, eventType, value);
      } else if (typeof value === "boolean" || value === null) {
        // Boolean 또는 null 값 처리
        if (key === "checked" || key === "selected") {
          // Property만 설정하고 DOM 속성은 제거
          if (value === null) {
            $el[key] = false; // null이면 기본값으로
          } else {
            $el[key] = value;
          }
          $el.removeAttribute(key);
        } else {
          // 일반 boolean 속성들 (disabled, readOnly 등)
          if (value === null) {
            $el[key] = false; // null이면 기본값으로
            $el.removeAttribute(key);
          } else {
            $el[key] = value;
            if (value) {
              $el.setAttribute(key, "");
            } else {
              $el.removeAttribute(key);
            }
          }
        }
      } else if (!key.startsWith("on")) {
        // 일반 속성 처리
        if (value === null || value === undefined) {
          $el.removeAttribute(key);
        } else {
          $el.setAttribute(key, value);
        }
      }
    }
  }

  return {
    ...props,
    $el,
  };
}
