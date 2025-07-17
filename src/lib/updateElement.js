// import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";
import { addEvent, removeEvent } from "./eventManager.js";

// 함수형 컴포넌트의 타입을 비교하는 헬퍼 함수
function isSameType(newType, oldType) {
  // 둘 다 함수인 경우 함수 이름으로 비교
  if (typeof newType === "function" && typeof oldType === "function") {
    return newType.name === oldType.name || newType === oldType;
  }
  // 일반적인 타입 비교
  return newType === oldType;
}

export function updateElement(parent, newNode, oldNode, index = 0) {
  // 1. oldNode만 있는 경우
  if (!newNode && oldNode) {
    return parent.removeChild(parent.childNodes[index]);
  }

  // 2. newNode만 있는 경우
  if (newNode && !oldNode) {
    return parent.appendChild(createElement(newNode));
  }

  // 3. oldNode와 newNode 모두 text 타입일 경우
  if (typeof newNode === "string" && typeof oldNode === "string") {
    // 같으면 아무것도 하지 않음 -> 성능 최적화 고려
    if (newNode === oldNode) return;
    return parent.replaceChild(createElement(newNode), parent.childNodes[index]);
  }

  // 4. oldNode와 newNode의 타입이 다를 경우
  if (!isSameType(newNode.type, oldNode.type)) {
    return parent.replaceChild(createElement(newNode), parent.childNodes[index]);
  }

  // 5. oldNode와 newNode의 타입이 같을 경우
  updateAttributes(parent.childNodes[index], newNode.props || {}, oldNode.props || {});

  // 6. newNode와 oldNode의 모든 자식 태그를 순회하며 1 ~ 5의 내용을 반복한다.
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];

  // 먼저 공통된 자식들을 처리
  for (let i = 0; i < Math.min(newChildren.length, oldChildren.length); i++) {
    updateElement(parent.childNodes[index], newChildren[i], oldChildren[i], i);
  }

  // 새로운 자식들을 추가
  for (let i = oldChildren.length; i < newChildren.length; i++) {
    const childElement = createElement(newChildren[i]);
    parent.childNodes[index].appendChild(childElement);
  }

  // 초과하는 기존 자식들을 역순으로 제거
  for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
    if (parent.childNodes[index].childNodes[i]) {
      parent.childNodes[index].removeChild(parent.childNodes[index].childNodes[i]);
    }
  }
}

// 5 - newNode와 oldNode의 attribute를 비교하여 변경된 부분만 반영한다.
function updateAttributes(target, newProps, oldProps) {
  // 이벤트 리스너와 일반 속성 분리
  const newEventListeners = {};
  const oldEventListeners = {};
  const newAttributes = {};
  const oldAttributes = {};

  // 새 props에서 이벤트 리스너와 일반 속성 분리
  Object.keys(newProps).forEach((key) => {
    if (key.startsWith("on") && typeof newProps[key] === "function") {
      const eventName = key.toLowerCase().substring(2);
      newEventListeners[eventName] = newProps[key];
    } else if (key === "className") {
      newAttributes[key] = newProps[key];
    } else if (key !== "children") {
      newAttributes[key] = newProps[key];
    }
  });

  // 기존 props에서 이벤트 리스너와 일반 속성 분리
  Object.keys(oldProps).forEach((key) => {
    if (key.startsWith("on") && typeof oldProps[key] === "function") {
      const eventName = key.toLowerCase().substring(2);
      oldEventListeners[eventName] = oldProps[key];
    } else if (key === "className") {
      oldAttributes[key] = oldProps[key];
    } else if (key !== "children") {
      oldAttributes[key] = oldProps[key];
    }
  });

  // 이벤트 리스너 처리
  // 제거된 이벤트 리스너 처리
  Object.keys(oldEventListeners).forEach((eventName) => {
    if (!newEventListeners[eventName]) {
      removeEvent(target, eventName, oldEventListeners[eventName]);
    }
  });

  // 추가되거나 변경된 이벤트 리스너 처리
  Object.keys(newEventListeners).forEach((eventName) => {
    const newHandler = newEventListeners[eventName];
    const oldHandler = oldEventListeners[eventName];

    if (oldHandler && oldHandler !== newHandler) {
      // 핸들러가 변경된 경우
      removeEvent(target, eventName, oldHandler);
      addEvent(target, eventName, newHandler);
    } else if (!oldHandler) {
      // 새로운 핸들러 추가
      addEvent(target, eventName, newHandler);
    }
  });

  // Boolean 속성들 (DOM property로 직접 설정)
  const booleanProps = ["checked", "disabled", "selected", "readOnly"];

  // Boolean 속성 처리
  booleanProps.forEach((prop) => {
    const newValue = newProps[prop];
    const oldValue = oldProps[prop];

    if (newValue !== undefined) {
      if (newValue !== oldValue) {
        target[prop] = newValue;

        // DOM attribute 처리
        if (newValue === true) {
          if (prop === "checked") {
            // checked는 DOM attribute를 설정하지 않음
            target.removeAttribute(prop);
          } else {
            target.setAttribute(prop, "");
          }
        } else {
          target.removeAttribute(prop);
        }
      }
    } else if (oldValue !== undefined) {
      // 속성이 제거된 경우
      target[prop] = false;
      target.removeAttribute(prop);
    }
  });

  // <option>의 selected 속성 특별 처리
  if (target.tagName === "OPTION" && ("selected" in newProps || "selected" in oldProps)) {
    if (newProps.selected) {
      target.selected = true;
      target.removeAttribute("selected");
    } else {
      target.selected = false;
      target.removeAttribute("selected");
    }
  }

  // selected 속성 특별 처리 (select 요소의 경우)
  if (target.tagName === "SELECT") {
    const options = target.querySelectorAll("option");
    let hasSelected = false;

    // selected=true인 옵션이 있는지 확인
    options.forEach((option) => {
      if (option.selected) {
        hasSelected = true;
      }
    });

    // selected=true인 옵션이 없으면 첫 번째 옵션을 선택
    if (!hasSelected && options.length > 0) {
      options[0].selected = true;
    }
  }

  // 일반 속성 처리
  // 달라지거나 추가된 Props를 반영
  for (const [attr, value] of Object.entries(newAttributes)) {
    // Boolean 속성은 이미 처리됨
    if (booleanProps.includes(attr)) continue;

    if (oldAttributes[attr] === newAttributes[attr]) continue;

    if (attr === "className") {
      target.className = value;
    } else if (attr === "style" && typeof value === "object") {
      Object.assign(target.style, value);
    } else {
      target.setAttribute(attr, value);
    }
  }

  // 없어진 props를 attribute에서 제거
  for (const attr of Object.keys(oldAttributes)) {
    // Boolean 속성은 이미 처리됨
    if (booleanProps.includes(attr)) continue;

    if (newAttributes[attr] !== undefined) continue;

    if (attr === "className") {
      target.className = "";
      target.removeAttribute("class");
    } else {
      target.removeAttribute(attr);
    }
  }
}
