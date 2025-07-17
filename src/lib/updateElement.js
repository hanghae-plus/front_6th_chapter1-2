import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

// 상수 정의
const BOOLEAN_PROPS = ["checked", "disabled", "selected", "readOnly"];
const EVENT_PREFIX = "on";
const CHILDREN_KEY = "children";
const CLASS_NAME_KEY = "className";
const STYLE_KEY = "style";

/**
 * 이벤트 핸들러를 정리합니다
 */
function cleanupEventHandlers(element, props) {
  if (!element || !props) return;

  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith(EVENT_PREFIX) && typeof value === "function") {
      const eventName = key.toLowerCase().substring(2);
      removeEvent(element, eventName, value);
    }
  });
}

/**
 * 이벤트 핸들러를 처리합니다
 */
function handleEventHandlers(target, key, value, oldValue) {
  const eventName = key.toLowerCase().substring(2);

  if (oldValue !== value) {
    if (oldValue && typeof oldValue === "function") {
      removeEvent(target, eventName, oldValue);
    }
    addEvent(target, eventName, value);
  }
}

/**
 * boolean 속성을 처리합니다
 */
function handleBooleanProps(target, key, value) {
  target[key] = !!value;

  if (key === "disabled" || key === "readOnly") {
    if (value) {
      target.setAttribute(key, "");
    } else {
      target.removeAttribute(key);
    }
  } else {
    target.removeAttribute(key);
  }
}

/**
 * 제거된 속성들을 정리합니다
 */
function cleanupRemovedAttributes(target, oldProps, newProps) {
  if (!oldProps) return;

  Object.keys(oldProps).forEach((key) => {
    if (key === CHILDREN_KEY) return;

    if (!newProps || !(key in newProps)) {
      if (key.startsWith(EVENT_PREFIX)) {
        const eventName = key.toLowerCase().substring(2);
        if (oldProps[key]) {
          removeEvent(target, eventName, oldProps[key]);
        }
      } else if (key === CLASS_NAME_KEY) {
        target.className = "";
        target.removeAttribute("class");
      } else if (BOOLEAN_PROPS.includes(key)) {
        target[key] = false;
        target.removeAttribute(key);
      } else {
        target.removeAttribute(key);
      }
    }
  });
}

/**
 * 요소의 속성을 업데이트합니다
 */
function updateAttributes(target, originNewProps, originOldProps) {
  if (!target) return;

  // 새로운 속성들 적용
  if (originNewProps) {
    Object.entries(originNewProps).forEach(([key, value]) => {
      if (key === CHILDREN_KEY) return;

      if (key.startsWith(EVENT_PREFIX) && typeof value === "function") {
        const oldValue = originOldProps && originOldProps[key];
        handleEventHandlers(target, key, value, oldValue);
      } else if (key === CLASS_NAME_KEY) {
        target.className = value;
      } else if (key === STYLE_KEY && typeof value === "object") {
        Object.assign(target.style, value);
      } else if (BOOLEAN_PROPS.includes(key)) {
        handleBooleanProps(target, key, value);
      } else if (value != null) {
        target.setAttribute(key, value);
      }
    });
  }

  // 제거된 속성들 정리
  cleanupRemovedAttributes(target, originOldProps, originNewProps);
}

/**
 * 노드를 제거합니다
 */
function removeNode(parentElement, oldNode, index) {
  const child = parentElement.childNodes[index];
  if (child) {
    cleanupEventHandlers(child, oldNode.props);
    parentElement.removeChild(child);
  }
}

/**
 * 새 노드를 추가합니다
 */
function addNode(parentElement, newNode) {
  const newElement = createElement(newNode);
  parentElement.appendChild(newElement);
}

/**
 * 텍스트 노드를 업데이트합니다
 */
function updateTextNode(parentElement, newNode, oldNode, index) {
  if (newNode !== oldNode) {
    const child = parentElement.childNodes[index];
    if (child && child.nodeType === Node.TEXT_NODE) {
      child.textContent = newNode;
    }
  }
}

/**
 * 텍스트 노드를 요소 노드로 변경합니다
 */
function replaceTextWithElement(parentElement, newNode, index) {
  const newElement = createElement(newNode);
  const oldChild = parentElement.childNodes[index];

  if (oldChild) {
    parentElement.replaceChild(newElement, oldChild);
  } else {
    parentElement.appendChild(newElement);
  }
}

/**
 * 요소 노드를 텍스트 노드로 변경합니다
 */
function replaceElementWithText(parentElement, newNode, oldNode, index) {
  const oldElement = parentElement.childNodes[index];

  if (oldElement && oldNode.props) {
    cleanupEventHandlers(oldElement, oldNode.props);
  }

  const newTextNode = document.createTextNode(newNode);

  if (oldElement) {
    parentElement.replaceChild(newTextNode, oldElement);
  } else {
    parentElement.appendChild(newTextNode);
  }
}

/**
 * 요소 노드를 다른 타입의 요소로 교체합니다
 */
function replaceElement(parentElement, newNode, oldNode, index) {
  const oldElement = parentElement.childNodes[index];

  if (oldElement && oldNode.props) {
    cleanupEventHandlers(oldElement, oldNode.props);
  }

  const newElement = createElement(newNode);

  if (oldElement) {
    parentElement.replaceChild(newElement, oldElement);
  } else {
    parentElement.appendChild(newElement);
  }
}

/**
 * 자식 노드들을 업데이트합니다
 */
function updateChildren(element, newChildren, oldChildren) {
  const newChildrenArray = newChildren || [];
  const oldChildrenArray = oldChildren || [];
  const minLength = Math.min(oldChildrenArray.length, newChildrenArray.length);

  // 겹치는 부분 먼저 업데이트
  for (let i = 0; i < minLength; i++) {
    updateElement(element, newChildrenArray[i], oldChildrenArray[i], i);
  }

  // oldChildren이 더 많으면 초과 부분 역순으로 제거
  if (oldChildrenArray.length > newChildrenArray.length) {
    for (let i = oldChildrenArray.length - 1; i >= newChildrenArray.length; i--) {
      if (element.childNodes[i]) {
        element.removeChild(element.childNodes[i]);
      }
    }
  }
  // newChildren이 더 많으면 초과 부분 정방향으로 추가
  else if (newChildrenArray.length > oldChildrenArray.length) {
    for (let i = oldChildrenArray.length; i < newChildrenArray.length; i++) {
      updateElement(element, newChildrenArray[i], null, i);
    }
  }
}

/**
 * 요소 노드를 업데이트합니다
 */
function updateElementNode(parentElement, newNode, oldNode, index) {
  const element = parentElement.childNodes[index];
  if (!element) return;

  updateAttributes(element, newNode.props, oldNode.props);
  updateChildren(element, newNode.children, oldNode.children);
}

/**
 * 메인 업데이트 함수
 */
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 둘 다 null이면 아무것도 하지 않음
  if (!newNode && !oldNode) return;

  // newNode가 null이면 oldNode 제거
  if (!newNode && oldNode) {
    removeNode(parentElement, oldNode, index);
    return;
  }

  // oldNode가 null이면 newNode 추가
  if (newNode && !oldNode) {
    addNode(parentElement, newNode);
    return;
  }

  // 둘 다 텍스트 노드인 경우
  if (typeof newNode === "string" && typeof oldNode === "string") {
    updateTextNode(parentElement, newNode, oldNode, index);
    return;
  }

  // 텍스트 노드에서 요소 노드로 변경
  if (typeof newNode === "object" && typeof oldNode === "string") {
    replaceTextWithElement(parentElement, newNode, index);
    return;
  }

  // 요소 노드에서 텍스트 노드로 변경
  if (typeof newNode === "string" && typeof oldNode === "object") {
    replaceElementWithText(parentElement, newNode, oldNode, index);
    return;
  }

  // 둘 다 요소 노드인 경우
  if (newNode && oldNode && typeof newNode === "object" && typeof oldNode === "object") {
    // 타입이 다르면 교체
    if (newNode.type !== oldNode.type) {
      replaceElement(parentElement, newNode, oldNode, index);
      return;
    }

    // 타입이 같으면 속성 업데이트
    updateElementNode(parentElement, newNode, oldNode, index);
  }
}
