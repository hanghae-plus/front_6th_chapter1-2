import { BOOLEAN_ATTRIBUTE_PROPS, PROPERTY_ONLY_PROPS } from "../constants.js";
import { createElement } from "./createElement.js";
import { addEvent, removeEvent } from "./eventManager.js";

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 둘 다 없으면 아무것도 하지 않음
  if (!newNode && !oldNode) {
    return;
  }

  // 새로운 노드가 없을 경우, 기존 노드를 제거한다.
  if (!newNode && oldNode) {
    const child = parentElement.childNodes[index];
    if (child) {
      return parentElement.removeChild(child);
    }
  }

  // 기존 노드가 없을 경우, 새로운 노드를 추가한다.
  if (newNode && !oldNode) {
    return parentElement.appendChild(createElement(newNode));
  }

  // 기존 자식 노드 가져오기
  const $currentNode = parentElement.childNodes[index];

  // 현재 노드가 없는 경우 새로운 노드 추가
  // index가 밀릴 상황을 대비하여 없으면 새로 추가한다.
  if (!$currentNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  // 새로운 노드와 기존 노드가 모두 text 타입 일 경우 text를 업데이트한다.
  if (
    (typeof newNode === "string" || typeof newNode === "number") &&
    (typeof oldNode === "string" || typeof oldNode === "number")
  ) {
    // text가 동일할 경우 업데이트를 하지 않는다.
    if (newNode === oldNode) {
      return;
    }
    const newTextNode = document.createTextNode(newNode);
    return parentElement.replaceChild(newTextNode, $currentNode);
  }

  // 새로운 노드와 기존 노드의 type이 다를 경우, 새로운 노드를 추가한다.
  if (newNode.type !== oldNode.type) {
    return parentElement.replaceChild(createElement(newNode), $currentNode);
  }

  // 새로운 노드와 기존 노드의 props를 확인한다.
  const newProps = newNode.props || {};
  const oldProps = oldNode.props || {};

  updateAttributes($currentNode, newProps, oldProps);

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  for (let i = 0; i < maxLength; i++) {
    updateElement($currentNode, newChildren[i], oldChildren[i], i);
  }

  // 남은 이전 자식 노드들 제거
  while ($currentNode.childNodes.length > newChildren.length) {
    $currentNode.removeChild($currentNode.lastChild);
  }
}

function updateAttributes(target, originNewProps, originOldProps) {
  if (!target) return;

  // 이벤트 핸들러와 일반 속성을 분리
  const { eventProps: newEventProps, regularProps: newRegularProps } = separateProps(originNewProps);
  const { eventProps: oldEventProps, regularProps: oldRegularProps } = separateProps(originOldProps);

  // 일반 속성 업데이트
  updateRegularAttributes(target, newRegularProps, oldRegularProps);

  // 이벤트 핸들러 업데이트
  updateEventHandlers(target, newEventProps, oldEventProps);
}

function separateProps(props) {
  const eventProps = {};
  const regularProps = {};

  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("on") && typeof value === "function") {
      eventProps[key] = value;
    } else {
      regularProps[key] = value;
    }
  }

  return { eventProps, regularProps };
}

function updateRegularAttributes(target, newProps, oldProps) {
  // 속성이 달라지거나 새로 추가된 속성일 경우 속성을 업데이트한다.
  for (const [attr, value] of Object.entries(newProps)) {
    if (oldProps[attr] === value) {
      continue;
    }

    if (PROPERTY_ONLY_PROPS.has(attr)) {
      // checked, selected: property만 설정하고 DOM attribute는 항상 제거
      target[attr] = !!value;
      target.removeAttribute(attr);
    } else if (BOOLEAN_ATTRIBUTE_PROPS.has(attr)) {
      // disabled 등: property와 DOM attribute 모두 관리
      if (value) {
        target[attr] = true;
        target.setAttribute(attr, "");
      } else {
        target[attr] = false;
        target.removeAttribute(attr);
      }
    } else {
      // 일반 속성 처리
      const attribute = attr === "className" ? "class" : attr;
      target.setAttribute(attribute, value);
    }
  }

  // 속성이 없어진 경우 속성을 제거한다.
  for (const attr of Object.keys(oldProps)) {
    if (newProps[attr] !== undefined) {
      continue;
    }

    if (PROPERTY_ONLY_PROPS.has(attr)) {
      target[attr] = false;
      target.removeAttribute(attr);
    } else if (BOOLEAN_ATTRIBUTE_PROPS.has(attr)) {
      target[attr] = false;
      target.removeAttribute(attr);
    } else {
      const attribute = attr === "className" ? "class" : attr;
      target.removeAttribute(attribute);
    }
  }
}

function updateEventHandlers(target, newEventProps, oldEventProps) {
  // 기존 이벤트 핸들러 제거
  for (const [eventProp, handler] of Object.entries(oldEventProps)) {
    if (!newEventProps[eventProp] || newEventProps[eventProp] !== handler) {
      const eventType = eventProp.slice(2).toLowerCase(); // onClick -> click
      removeEvent(target, eventType, handler);
    }
  }

  // 새로운 이벤트 핸들러 추가
  for (const [eventProp, handler] of Object.entries(newEventProps)) {
    if (!oldEventProps[eventProp] || oldEventProps[eventProp] !== handler) {
      const eventType = eventProp.slice(2).toLowerCase(); // onClick -> click
      addEvent(target, eventType, handler, target._vNode);
    }
  }
}
