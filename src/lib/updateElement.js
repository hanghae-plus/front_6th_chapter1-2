import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, newProps, oldProps) {
  // 기존 속성들 제거
  if (oldProps) {
    Object.keys(oldProps).forEach((key) => {
      if (!(newProps && key in newProps)) {
        // 새 props에 없는 속성들 제거
        if (key.startsWith("on")) {
          // 이벤트 제거
          const eventType = key.slice(2).toLowerCase(); // onClick -> click
          removeEvent(target, eventType, oldProps[key]);
        } else if (key === "className") {
          target.removeAttribute("class");
        } else {
          target.removeAttribute(key);
        }
      }
    });
  }

  // 새 속성들 추가/업데이트
  if (newProps) {
    Object.keys(newProps).forEach((key) => {
      const newValue = newProps[key];
      const oldValue = oldProps ? oldProps[key] : undefined;

      // 값이 변경된 경우에만 업데이트
      if (newValue !== oldValue) {
        if (key === "className") {
          target.setAttribute("class", newValue);
        } else if (key === "onClick") {
          if (oldValue) removeEvent(target, "click", oldValue);
          addEvent(target, "click", newValue);
        } else if (key === "onMouseOver") {
          if (oldValue) removeEvent(target, "mouseover", oldValue);
          addEvent(target, "mouseover", newValue);
        } else if (key === "onFocus") {
          if (oldValue) removeEvent(target, "focus", oldValue);
          addEvent(target, "focus", newValue);
        } else if (key === "onKeyDown") {
          if (oldValue) removeEvent(target, "keydown", oldValue);
          addEvent(target, "keydown", newValue);
        } else if (key === "onChange") {
          if (oldValue) removeEvent(target, "change", oldValue);
          addEvent(target, "change", newValue);
        } else if (key === "onBlur") {
          if (oldValue) removeEvent(target, "blur", oldValue);
          addEvent(target, "blur", newValue);
        } else if (key === "checked") {
          target.checked = newValue; // ✅ 프로퍼티로 설정
        } else if (key === "selected") {
          target.selected = newValue; // ✅ 프로퍼티로 설정
        } else if (typeof newValue === "boolean") {
          newValue === true ? target.setAttribute(key, "") : target.removeAttribute(key);
        } else {
          target.setAttribute(key, newValue);
        }
      }
    });
  }
}

export function updateElement(container, newNode, oldNode, index = 0) {
  // Case 1: 기존 노드 없음 -> 새 노드 추가
  if (!oldNode) {
    container.appendChild(createElement(newNode));
    return;
  }

  // Case 2: 새 노드 없음 -> 기존 노드 제거
  if (!newNode) {
    const currentElement = container.childNodes[index];
    if (currentElement) {
      container.removeChild(currentElement);
    }
    return;
  }

  // Case 3. 둘 다 없음
  if (!oldNode && !newNode) {
    return;
  }

  const currentElement = container.childNodes[index];

  // Case 4: 둘 다 문자열인 경우
  if (typeof oldNode === "string" && typeof newNode === "string") {
    if (oldNode !== newNode) {
      if (currentElement && currentElement.nodeType === Node.TEXT_NODE) {
        currentElement.textContent = newNode;
      } else {
        currentElement
          ? container.replaceChild(createElement(newNode), currentElement)
          : container.appendChild(createElement(newNode));
      }
    }
    return;
  }

  // Case 5: 노드 타입이 다름 -> 완전 교체 TODO: 문자 -> 객체, 객체->문자 별도로 해야하나?
  if (oldNode.type !== newNode.type) {
    container.replaceChild(createElement(newNode), currentElement);
    return;
  }

  // Case 6: 같은 타입 -> 속성과 자식들 업데이트
  if (oldNode.type === newNode.type) {
    if (!currentElement) {
      container.appendChild(createElement(newNode));
      return;
    }

    // 속성 업데이트
    updateAttributes(currentElement, newNode.props, oldNode.props);

    const oldChildrenLength = oldNode.children ? oldNode.children.length : 0;
    const newChildrenLength = newNode.children ? newNode.children.length : 0;
    const commonLength = Math.min(oldChildrenLength, newChildrenLength);

    for (let i = 0; i < commonLength; i++) {
      const oldChild = oldNode.children[i];
      const newChild = newNode.children[i];

      updateElement(currentElement, newChild, oldChild, i);
    }

    // 새로운 자식 추가
    for (let i = commonLength; i < newChildrenLength; i++) {
      const newChild = newNode.children[i];

      updateElement(currentElement, newChild, null, i);
    }

    // 기존 자식 제거
    if (oldChildrenLength > newChildrenLength) {
      for (let i = oldChildrenLength - 1; i >= newChildrenLength; i--) {
        const elementToRemove = currentElement.childNodes[i];
        if (elementToRemove) {
          currentElement.removeChild(elementToRemove);
        }
      }
    }
  }
}
