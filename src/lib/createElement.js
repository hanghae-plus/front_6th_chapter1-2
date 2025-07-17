import { addEvent } from "./eventManager";

// 상수 정의
const BOOLEAN_PROPS = ["checked", "disabled", "selected", "readOnly"];
const DOM_ATTRIBUTE_PROPS = ["disabled", "readOnly"];
const REMOVE_ATTRIBUTE_PROPS = ["checked", "selected"];

/**
 * 가상 노드를 실제 DOM 요소로 변환
 * @param {any} vNode - 변환할 가상 노드
 * @returns {Node} - 생성된 DOM 노드
 */
export function createElement(vNode) {
  // null, undefined, boolean 처리
  if (isNullOrBoolean(vNode)) {
    return createEmptyTextNode();
  }

  // 문자열이나 숫자 처리
  if (isPrimitive(vNode)) {
    return createTextNode(vNode);
  }

  // 배열 처리
  if (Array.isArray(vNode)) {
    return createFragmentFromArray(vNode);
  }

  // 객체 형태의 가상 노드 처리
  return createElementFromVNode(vNode);
}

/**
 * null, undefined, boolean 값인지 확인
 */
function isNullOrBoolean(value) {
  return value == null || typeof value === "boolean";
}

/**
 * 원시 타입(문자열, 숫자)인지 확인
 */
function isPrimitive(value) {
  return typeof value === "string" || typeof value === "number";
}

/**
 * 빈 텍스트 노드 생성
 */
function createEmptyTextNode() {
  return document.createTextNode("");
}

/**
 * 텍스트 노드 생성
 */
function createTextNode(value) {
  return document.createTextNode(String(value));
}

/**
 * 배열로부터 DocumentFragment 생성
 */
function createFragmentFromArray(vNodeArray) {
  const fragment = document.createDocumentFragment();
  vNodeArray.forEach((child) => {
    const childElement = createElement(child);
    fragment.appendChild(childElement);
  });
  return fragment;
}

/**
 * 가상 노드로부터 DOM 요소 생성
 */
function createElementFromVNode(vNode) {
  const { type, props = {}, children = [] } = vNode;

  if (typeof type === "string") {
    return createHTMLElement(type, props, children);
  }

  if (typeof type === "function") {
    throw new Error("함수형 컴포넌트는 createElement로 직접 처리할 수 없습니다. 먼저 normalizeVNode로 정규화하세요.");
  }

  return createEmptyTextNode();
}

/**
 * HTML 요소 생성
 */
function createHTMLElement(type, props, children) {
  const element = document.createElement(type);

  applyAttributes(element, props);
  appendChildren(element, children);

  return element;
}

/**
 * 자식 요소들을 부모 요소에 추가
 */
function appendChildren(parent, children) {
  children.forEach((child) => {
    const childElement = createElement(child);
    parent.appendChild(childElement);
  });
}

/**
 * 요소에 속성들을 적용
 */
function applyAttributes(element, props) {
  if (!props || Object.keys(props).length === 0) {
    return;
  }

  Object.entries(props).forEach(([key, value]) => {
    if (key === "children") {
      return;
    }

    if (isEventHandler(key, value)) {
      addEventHandler(element, key, value);
      return;
    }

    if (key === "className") {
      element.className = value;
      return;
    }

    if (isStyleObject(key, value)) {
      applyStyleObject(element, value);
      return;
    }

    if (isBooleanProp(key)) {
      applyBooleanAttribute(element, key, value);
      return;
    }

    applyRegularAttribute(element, key, value);
  });
}

/**
 * 이벤트 핸들러인지 확인
 */
function isEventHandler(key, value) {
  return key.startsWith("on") && typeof value === "function";
}

/**
 * 이벤트 핸들러 추가
 */
function addEventHandler(element, key, value) {
  const eventName = key.toLowerCase().substring(2);
  addEvent(element, eventName, value);
}

/**
 * style 객체인지 확인
 */
function isStyleObject(key, value) {
  return key === "style" && typeof value === "object";
}

/**
 * style 객체 적용
 */
function applyStyleObject(element, styleObject) {
  Object.assign(element.style, styleObject);
}

/**
 * boolean 속성인지 확인
 */
function isBooleanProp(key) {
  return BOOLEAN_PROPS.includes(key);
}

/**
 * boolean 속성 적용
 */
function applyBooleanAttribute(element, key, value) {
  element[key] = !!value;

  if (DOM_ATTRIBUTE_PROPS.includes(key)) {
    if (value) {
      element.setAttribute(key, "");
    } else {
      element.removeAttribute(key);
    }
  } else if (REMOVE_ATTRIBUTE_PROPS.includes(key)) {
    element.removeAttribute(key);
  }
}

/**
 * 일반 속성 적용
 */
function applyRegularAttribute(element, key, value) {
  if (value != null) {
    element.setAttribute(key, value);
  }
}
