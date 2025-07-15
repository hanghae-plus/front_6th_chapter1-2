// function updateAttributes($el, props) {}
import { addEvent } from "./eventManager";

export function createElement(vNode) {
  if (isString(vNode) || isNumber(vNode)) {
    return document.createTextNode(vNode);
  }

  if (Array.isArray(vNode)) {
    const fragment = new DocumentFragment();
    for (let i = 0; i < vNode.length; i++) {
      const $el = createElement(vNode[i]);
      fragment.appendChild($el);
    }
    return fragment;
  }

  if (isJSX(vNode)) {
    return createElementFromJSX(vNode);
  }

  return document.createTextNode("");
}

function setAttributes($el, props) {
  if (props === null) {
    return;
  }

  const entries = Object.entries(props);

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    const isValidValue = isString(value) || isNumber(value) || isBoolean(value) || isFunction(value);

    if (isEvent(key, value)) {
      addEvent($el, normalizeEventName(key), value);
      continue;
    }

    if (!isValidValue) {
      continue;
    }

    switch (key) {
      case "className":
        $el.className = value;
        break;

      case "children":
        break;

      default:
        if (knownBooleanAttributeMap.has(key)) {
          setKnownBooleanAttributes($el, knownBooleanAttributeMap.get(key), value);
          break;
        }

        $el.setAttribute(key, value);
        break;
    }
  }
}

function updateChildren($el, children) {
  for (let i = 0; i < children.length; i++) {
    if (!isNullish(children[i])) {
      const $child = createElement(children[i]);
      $el.appendChild($child);
    }
  }
}

function createElementFromJSX(vNode) {
  const { type, props, children } = vNode;

  if (isFunction(type)) {
    throw new TypeError("createElement 함수는 컴포넌트를 처리할 수 없습니다.");
  }

  const $el = document.createElement(type);
  setAttributes($el, props);
  updateChildren($el, children);
  return $el;
}

function isNullish(value) {
  return value === null || value === undefined;
}

function isBoolean(value) {
  return typeof value === "boolean";
}

function isString(value) {
  return typeof value === "string";
}

function isNumber(value) {
  return typeof value === "number";
}

function isFunction(value) {
  return typeof value === "function";
}

function isEvent(key, value) {
  return key.startsWith("on") && isFunction(value);
}

function normalizeEventName(name) {
  return name.slice(2).toLowerCase();
}

function isJSX(value) {
  if (typeof value !== "object" || value === null) {
    // 객체 형태가 아니면 JSX 가 아니다.
    return false;
  }

  if (!("type" in value) || !("props" in value) || !("children" in value)) {
    // 객체 형태이지만 필수 프로퍼티가 없으면 JSX 가 아니다.
    return false;
  }

  if (!(isString(value.type) || isFunction(value.type))) {
    // type 값이 문자열 또는 함수가 아니면 JSX 가 아니다.
    // 현재는 함수형 컴포넌트만 고려
    return false;
  }

  if (typeof value.props !== "object") {
    // props 값이 객체가 아니면 JSX 가 아니다.
    return false;
  }

  if (!Array.isArray(value.children)) {
    // children 값이 배열이 아니면 JSX 가 아니다.
    return false;
  }

  return true;
}

function setKnownBooleanAttributes($el, key, value) {
  if (value === true) {
    $el.setAttribute(key, "");
  }
}

const knownBooleanAttributeMap = new Map([
  // [JSX 속성 이름, DOM 속성 이름]
  // 실제론 더 많은 속성을 설정해야 함
  ["disabled", "disabled"],
]);
