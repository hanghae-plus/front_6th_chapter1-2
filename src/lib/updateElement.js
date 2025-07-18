import { createElement } from "./createElement";
import { addEvent, removeEvent } from "./eventManager";

/**
 * DOM element에 속성(props) 업데이트 (이전 속성과 비교)
 * @param {HTMLElement} target - 대상 DOM element
 * @param {Object} newProps - 새로운 속성들
 * @param {Object} oldProps - 이전 속성들
 */
function updateAttributes(target, newProps, oldProps) {
  const oldKeys = Object.keys(oldProps || {});
  const newKeys = Object.keys(newProps || {});

  // 1. 제거 단계: 이전에만 있는 속성들 제거
  oldKeys.forEach((key) => {
    if (!(key in (newProps || {}))) {
      removeAttribute(target, key, oldProps[key]);
    }
  });

  // 2. 추가/변경 단계: 새 속성들을 이전 값과 비교하여 처리
  newKeys.forEach((key) => {
    const oldValue = oldProps?.[key];
    const newValue = newProps[key];

    // 값이 동일하면 DOM 조작 스킵
    if (oldValue === newValue) return;

    setAttribute(target, key, newValue, oldValue);
  });
}

/**
 * 속성 제거 전용 헬퍼 함수
 *
 * @param {HTMLElement} target - 대상 DOM element
 * @param {string} key - 제거할 속성 키
 * @param {*} oldValue - 제거할 속성의 이전 값
 */
function removeAttribute(target, key, oldValue) {
  // 1. 이벤트 핸들러 제거
  if (key.startsWith("on") && typeof oldValue === "function") {
    const eventType = key.slice(2).toLowerCase(); // onClick → click
    removeEvent(target, eventType, oldValue);
    return;
  }

  // 2. className 속성 제거
  if (key === "className") {
    target.removeAttribute("class");
    return;
  }

  // 3. Boolean 속성 제거 (disabled, checked, hidden 등)
  if (typeof oldValue === "boolean") {
    target.removeAttribute(key);
    // JavaScript 속성도 함께 false로 설정
    if (key in target) {
      target[key] = false;
    }
    return;
  }

  // 4. 일반 속성 제거 (id, data-*, href 등)
  target.removeAttribute(key);
}

/**
 * 속성 설정 전용 헬퍼 함수
 *
 * @param {HTMLElement} target - 대상 DOM element
 * @param {string} key - 설정할 속성 키
 * @param {*} newValue - 설정할 새 값
 * @param {*} oldValue - 이전 값 (이벤트 핸들러 교체 시 필요)
 */
function setAttribute(target, key, newValue, oldValue) {
  // 1. 이벤트 핸들러 설정/교체
  if (key.startsWith("on") && typeof newValue === "function") {
    const eventType = key.slice(2).toLowerCase(); // onClick → click
    // 기존 이벤트 핸들러가 있으면 먼저 제거
    if (oldValue) {
      removeEvent(target, eventType, oldValue);
    }
    // 새 이벤트 핸들러 추가
    addEvent(target, eventType, newValue);
    return;
  }

  // 2. className 속성 설정
  if (key === "className") {
    if (newValue) {
      target.setAttribute("class", newValue);
    } else {
      target.removeAttribute("class");
    }
    return;
  }

  // 3. Boolean 속성 설정 (checked, disabled, selected, readOnly)
  if (typeof newValue === "boolean") {
    if (key === "checked" || key === "selected") {
      // JavaScript 속성만 사용 (true/false 모두 처리)
      target[key] = newValue;
    } else if (key === "readOnly") {
      // readOnly → readonly 변환
      if (newValue) {
        target.setAttribute("readonly", "");
        target.readOnly = true;
      } else {
        target.removeAttribute("readonly");
        target.readOnly = false;
      }
    } else {
      // 일반 Boolean 속성 (disabled, hidden 등)
      if (newValue) {
        target.setAttribute(key, "");
        if (key in target) {
          target[key] = true;
        }
      } else {
        target.removeAttribute(key);
        if (key in target) {
          target[key] = false;
        }
      }
    }
    return;
  }

  // 4. 일반 속성 설정 (id, data-*, href, src 등)
  if (newValue != null) {
    target.setAttribute(key, newValue);
  } else {
    target.removeAttribute(key);
  }
}

/**
 * Virtual DOM diff 및 업데이트
 * @param {HTMLElement} parentElement - 업데이트할 부모 DOM element
 * @param {*} newNode - 새로운 vNode (문자열, 숫자, 객체, 배열, null/undefined 가능)
 * @param {*} oldNode - 기존 vNode (문자열, 숫자, 객체, 배열, null/undefined 가능)
 * @param {number} [index=0] - 부모 element 내에서의 위치 인덱스
 */
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 1. oldNode가 없으면 새 노드 추가
  if (!oldNode) {
    if (newNode && newNode !== "") {
      const element = createElement(newNode);
      const referenceNode = parentElement.childNodes[index];
      if (referenceNode) {
        parentElement.insertBefore(element, referenceNode);
      } else {
        parentElement.appendChild(element);
      }
    }
    return;
  }

  // 2. newNode가 없으면 기존 노드 제거
  if (!newNode || newNode === "") {
    const childNode = parentElement.childNodes[index];
    if (childNode) {
      parentElement.removeChild(childNode);
    }
    return;
  }

  // 3. 텍스트 노드 처리
  if (typeof newNode === "string" || typeof newNode === "number") {
    // 타입 체크 후 문자열 변환
    if (newNode !== oldNode) {
      const newText = String(newNode);
      const targetNode = parentElement.childNodes[index];
      if (targetNode && targetNode.nodeType === Node.TEXT_NODE) {
        targetNode.textContent = newText;
      } else {
        const textNode = document.createTextNode(newText);
        if (targetNode) {
          parentElement.replaceChild(textNode, targetNode);
        } else {
          parentElement.appendChild(textNode);
        }
      }
    }
    return;
  }

  // 4. 배열 처리
  if (Array.isArray(newNode) || Array.isArray(oldNode)) {
    const newChildren = Array.isArray(newNode) ? newNode : [newNode];
    const oldChildren = Array.isArray(oldNode) ? oldNode : [oldNode];
    const maxLength = Math.max(newChildren.length, oldChildren.length);

    for (let i = 0; i < maxLength; i++) {
      // 수정: index + i 대신 i를 사용 (배열 자체가 하나의 단위)
      updateElement(parentElement, newChildren[i], oldChildren[i], i);
    }
    return;
  }

  // 5. 노드 타입이 다르면 교체
  if (newNode.type !== oldNode.type) {
    const newElement = createElement(newNode);
    const targetNode = parentElement.childNodes[index];
    if (targetNode) {
      parentElement.replaceChild(newElement, targetNode);
    } else {
      parentElement.appendChild(newElement);
    }
    return;
  }

  // 6. 같은 타입이면 속성만 업데이트
  const targetElement = parentElement.childNodes[index];
  if (targetElement && targetElement.nodeType === Node.ELEMENT_NODE) {
    // 얕은 비교로 속성이 다를 때만 업데이트
    if (newNode.props !== oldNode.props) {
      updateAttributes(targetElement, newNode.props, oldNode.props);
    }

    // 7. 자식 노드들 재귀적으로 업데이트
    const newChildren = newNode.children || [];
    const oldChildren = oldNode.children || [];
    const maxLength = Math.max(newChildren.length, oldChildren.length);

    for (let i = 0; i < maxLength; i++) {
      updateElement(targetElement, newChildren[i], oldChildren[i], i);
    }

    // 불필요한 자식 노드 제거
    const excessCount = targetElement.childNodes.length - newChildren.length;
    for (let i = 0; i < excessCount; i++) {
      targetElement.removeChild(targetElement.lastChild);
    }
  }
}
