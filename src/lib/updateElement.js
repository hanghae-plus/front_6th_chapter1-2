import { createElement } from "./createElement";
import { addEvent, removeEvent } from "./eventManager";

/**
 * DOM 요소의 속성을 업데이트하는 함수입니다.
 *
 * @param {HTMLElement} $element - 업데이트할 DOM 요소
 * @param {Object} newProps - 새로운 속성들
 * @param {Object} oldProps - 이전 속성들
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
    if (index < $parent.childNodes.length) {
      $parent.insertBefore(newElement, $parent.childNodes[index]);
    } else {
      $parent.appendChild(newElement);
    }
    return;
  }

  // 둘 다 텍스트 노드인 경우
  if (typeof newNode === "string" && typeof oldNode === "string") {
    const childNode = $parent.childNodes[index];
    if (childNode && newNode !== oldNode) {
      childNode.textContent = newNode;
    } else if (!childNode) {
      $parent.appendChild(document.createTextNode(newNode));
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
  if (!currentNode) {
    $parent.appendChild(createElement(newNode));
    return;
  }

  updateAttributes(currentNode, newNode.props, oldNode.props);

  // 자식 노드 업데이트
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  // 자식 노드들을 순서대로 처리
  for (let i = 0; i < maxLength; i++) {
    const newChild = newChildren[i];
    const oldChild = oldChildren[i];

    // 새로운 자식이 없고 이전 자식이 있는 경우 제거
    if (!newChild && oldChild) {
      const targetNode = currentNode.childNodes[i];
      if (targetNode) {
        currentNode.removeChild(targetNode);
      }
      continue;
    }

    // 새로운 자식이 있고 이전 자식이 없는 경우 추가
    if (newChild && !oldChild) {
      const newElement = createElement(newChild);
      if (i < currentNode.childNodes.length) {
        currentNode.insertBefore(newElement, currentNode.childNodes[i]);
      } else {
        currentNode.appendChild(newElement);
      }
      continue;
    }

    // 둘 다 있는 경우 업데이트
    if (newChild && oldChild) {
      updateElement(currentNode, newChild, oldChild, i);
    }
  }

  // 남은 자식 노드 제거
  while (currentNode.childNodes.length > newChildren.length) {
    currentNode.removeChild(currentNode.lastChild);
  }
}
