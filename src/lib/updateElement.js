import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

// 이 파일은 실제 DOM과 Virtual DOM을 비교(diff)하여 변경된 부분만 업데이트하는 방식으로 작성되어 있다.
// 심화 과제에 대한 내용
// - Virtual DOM의 diff 알고리즘을 구현하여 실제 DOM과의 차이를 최소화하는 방식으로 업데이트를 수행한다.
// - 이를 위해 각 노드의 타입과 속성을 비교하고, 변경된 부분만을 효율적으로 업데이트하는 로직을 작성한다.

// 이렇게 하면 노가다 코드이다. 조금 더 클린하게 가능하다.
// 그래서 if 함수로 처리하면서 함수를 나누어 보았다.

function setBooleanAttribute(target, key, value) {
  target[key] = value;
  if (value) target.setAttribute(key, "");
  else target.removeAttribute(key);
}

function updateEvent(target, key, value, oldValue) {
  const eventType = key.slice(2).toLowerCase();
  if (oldValue) removeEvent(target, eventType, oldValue);
  if (value) addEvent(target, eventType, value);
}

function updateAttribute(target, key, value, oldValue) {
  if (key.startsWith("on") && typeof value === "function") {
    updateEvent(target, key, value, oldValue);
  } else if (key === "className") {
    target.setAttribute("class", value);
  } else if (key === "checked" || key === "selected") {
    target[key] = value;
    if (!value) target.removeAttribute(key);
  } else if (key === "disabled" || key === "readOnly") {
    setBooleanAttribute(target, key, value);
  } else if (typeof value === "boolean") {
    setBooleanAttribute(target, key, value);
  } else if (key !== "children") {
    target.setAttribute(key, value);
  }
}

function removeAttribute(target, key, oldValue) {
  if (key.startsWith("on") && typeof oldValue === "function") {
    const eventType = key.slice(2).toLowerCase();
    removeEvent(target, eventType, oldValue);
  } else if (key === "className") {
    target.removeAttribute("class");
  } else if (["checked", "selected", "disabled", "readOnly"].includes(key)) {
    target[key] = false;
    target.removeAttribute(key);
  } else {
    target.removeAttribute(key);
  }
}

function updateAttributes(target, newProps, oldProps) {
  // 기존 속성 제거
  if (oldProps) {
    Object.keys(oldProps).forEach((key) => {
      if (!newProps || !(key in newProps)) {
        removeAttribute(target, key, oldProps[key]);
      }
    });
  }
  // 새 속성 추가/업데이트
  if (newProps) {
    Object.entries(newProps).forEach(([key, value]) => {
      if (!oldProps || oldProps[key] !== value) {
        updateAttribute(target, key, value, oldProps && oldProps[key]);
      }
    });
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 1. 노드 제거 (newNode가 없고 oldNode가 있는 경우)
  if (!newNode && oldNode) {
    parentElement.removeChild(parentElement.childNodes[index]);
    return;
  }

  // 2. 새 노드 추가 (newNode가 있고 oldNode가 없는 경우)
  if (newNode && !oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  // 3. 텍스트 노드 업데이트
  if (typeof newNode === "string" && typeof oldNode === "string") {
    if (newNode !== oldNode) {
      parentElement.childNodes[index].textContent = newNode;
    }
    return;
  }

  // 4. 노드 교체 (newNode와 oldNode의 타입이 다른 경우)
  if (newNode.type !== oldNode.type) {
    parentElement.replaceChild(createElement(newNode), parentElement.childNodes[index]);
    return;
  }

  // 5. 같은 타입의 노드 업데이트 → 속성과 자식 요소들 업데이트
  if (newNode.type) {
    const element = parentElement.childNodes[index];

    // 5-1. 속성 업데이트
    updateAttributes(element, newNode.props, oldNode.props);

    // 5-2. 자식 요소들 재귀적 업데이트
    const newChildren = newNode.children || [];
    const oldChildren = oldNode.children || [];

    // 먼저 공통 인덱스 범위에 대해 업데이트
    for (let i = 0; i < Math.min(newChildren.length, oldChildren.length); i++) {
      updateElement(element, newChildren[i], oldChildren[i], i);
    }

    // 새로운 자식들 추가
    for (let i = oldChildren.length; i < newChildren.length; i++) {
      element.appendChild(createElement(newChildren[i]));
    }

    // 5-3. 초과하는 기존 자식들 제거 (역순으로)
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      const childToRemove = element.childNodes[i];
      if (childToRemove) {
        element.removeChild(childToRemove);
      }
    }
  }
}
