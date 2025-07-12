import { createElement } from "./createElement";
import { addEvent, removeEvent } from "./eventManager";

/**
 * DOM 요소의 속성을 업데이트하는 함수입니다.
 *
 * @param {HTMLElement} $element - 업데이트할 DOM 요소
 * @param {Object} newProps - 새로운 속성들
 * @param {Object} oldProps - 이전 속성들
 * @param {string} [newProps.className] - 새로운 클래스 이름
 * @param {boolean} [newProps.selected] - option 요소의 선택 상태
 * @param {boolean} [newProps.checked] - 체크박스/라디오 버튼의 체크 상태
 * @param {boolean} [newProps.disabled] - 요소의 비활성화 상태
 * @param {boolean} [newProps.readOnly] - 요소의 읽기 전용 상태
 */
function updateAttributes($element, newProps, oldProps) {
  // null 체크 및 기본값 설정
  newProps = newProps || {};
  oldProps = oldProps || {};

  const booleanAttributes = ["checked", "disabled", "readOnly"];

  // 이전 속성 제거
  for (const [name, value] of Object.entries(oldProps)) {
    if (!(name in newProps)) {
      if (name.startsWith("on")) {
        // 이벤트 리스너 제거
        const eventType = name.toLowerCase().substring(2);
        removeEvent($element, eventType, value);
      } else if (name === "className") {
        $element.className = "";
        $element.removeAttribute("class");
      } else if (booleanAttributes.includes(name)) {
        // boolean 속성 제거
        $element[name] = false;
        $element.removeAttribute(name);
      } else {
        $element.removeAttribute(name);
      }
    }
  }

  // 새로운 속성 추가/업데이트
  for (const [name, value] of Object.entries(newProps)) {
    if (value === oldProps[name]) continue;

    if (name.startsWith("on")) {
      // 이벤트 리스너 추가
      const eventType = name.toLowerCase().substring(2);
      if (oldProps[name]) {
        removeEvent($element, eventType, oldProps[name]);
      }
      addEvent($element, eventType, value);
    } else if (name === "className") {
      if (value) {
        $element.className = value;
      } else {
        $element.removeAttribute("class");
      }
    } else if (name === "selected" && $element.tagName === "OPTION") {
      // option 요소의 selected 속성 처리
      $element.selected = !!value;
    } else if (booleanAttributes.includes(name)) {
      // boolean 속성 처리
      $element[name] = !!value;
      if (!value) {
        $element.removeAttribute(name);
      }
    } else if (value === false || value == null) {
      $element.removeAttribute(name);
    } else {
      $element.setAttribute(name, value);
    }
  }
}

/**
 * 가상 DOM을 기반으로 실제 DOM을 업데이트하는 함수입니다.
 *
 * @param {HTMLElement} $parent - 부모 DOM 요소
 * @param {Object|string} newNode - 새로운 가상 DOM 노드
 * @param {Object|string} oldNode - 이전 가상 DOM 노드
 * @param {number} [index=0] - 자식 노드의 인덱스
 * @param {string} [newNode.type] - DOM 요소의 타입 (예: 'div', 'span' 등)
 * @param {Object} [newNode.props] - DOM 요소의 속성들
 * @param {string} [newNode.props.className] - 요소의 클래스 이름
 * @param {boolean} [newNode.props.selected] - option 요소의 선택 상태
 * @param {boolean} [newNode.props.checked] - 체크박스/라디오 버튼의 체크 상태
 * @param {boolean} [newNode.props.disabled] - 요소의 비활성화 상태
 * @param {boolean} [newNode.props.readOnly] - 요소의 읽기 전용 상태
 * @param {Array} [newNode.children] - 자식 노드들
 */
export function updateElement($parent, newNode, oldNode, index = 0) {
  // 노드가 없는 경우 처리
  if (!newNode && !oldNode) return;

  // 노드가 삭제된 경우
  if (!newNode) {
    const childNode = $parent.childNodes[index];
    if (childNode) {
      $parent.removeChild(childNode);
    }
    return;
  }

  // 노드가 새로 추가된 경우
  if (!oldNode) {
    const newElement = createElement(newNode);
    $parent.appendChild(newElement);
    return;
  }

  // 둘 다 텍스트 노드인 경우
  if (typeof newNode === "string" && typeof oldNode === "string") {
    if (newNode !== oldNode) {
      const childNode = $parent.childNodes[index];
      if (childNode) {
        childNode.textContent = newNode;
      }
    }
    return;
  }

  // 노드 타입이 다른 경우
  if (
    typeof newNode !== typeof oldNode ||
    (typeof newNode === "string" && typeof oldNode === "string" && newNode !== oldNode) ||
    newNode.type !== oldNode.type
  ) {
    const childNode = $parent.childNodes[index];
    const newElement = createElement(newNode);
    if (childNode) {
      $parent.replaceChild(newElement, childNode);
    } else {
      $parent.appendChild(newElement);
    }
    return;
  }

  // 속성 업데이트
  const currentNode = $parent.childNodes[index];
  if (currentNode) {
    updateAttributes(currentNode, newNode.props, oldNode.props);
  }

  // 자식 노드 업데이트
  const newLength = newNode.children?.length || 0;
  const oldLength = oldNode.children?.length || 0;
  const maxLength = Math.max(newLength, oldLength);

  // 자식 노드들을 역순으로 처리 (제거 시 인덱스 문제 방지)
  for (let i = maxLength - 1; i >= 0; i--) {
    const childNode = currentNode || $parent;
    updateElement(childNode, newNode.children?.[i], oldNode.children?.[i], i);
  }
}
