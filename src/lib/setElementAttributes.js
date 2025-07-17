import { addEvent } from "./eventManager";

const CHILDREN_KEY = "children";
const EVENT_PREFIX = "on";

/**
 * 기존 속성들을 제거하는 함수
 * @param {Element} target - 대상 DOM 요소
 * @param {Object} oldProps - 기존 속성들
 * @param {Object} newProps - 새로운 속성들
 */
const removeOldAttributes = (target, oldProps, newProps) => {
  for (const [key] of Object.entries(oldProps)) {
    if (key === CHILDREN_KEY) continue;

    if (!newProps || !(key in newProps)) {
      removeAttribute(target, key);
    }
  }
};

/**
 * 개별 속성을 제거하는 함수
 * @param {Element} target - 대상 DOM 요소
 * @param {string} key - 제거할 속성명
 */
const removeAttribute = (target, key) => {
  if (key === "className") {
    target.className = "";
    target.removeAttribute("class");
  } else if (key in target) {
    target[key] = target[key] === true ? false : "";
  } else {
    target.removeAttribute(key);
  }
};

/**
 * 이벤트 핸들러를 등록하는 함수
 * @param {Element} target - 대상 DOM 요소
 * @param {string} key - 이벤트 속성명 (예: "onClick")
 * @param {Function} handler - 이벤트 핸들러
 */
const registerEventHandler = (target, key, handler) => {
  const eventType = key.slice(EVENT_PREFIX.length).toLowerCase();
  addEvent(target, eventType, handler);
};

/**
 * DOM 속성을 설정하는 함수
 * @param {Element} target - 대상 DOM 요소
 * @param {string} key - 속성명
 * @param {any} value - 속성값
 */
const setDOMProperty = (target, key, value) => {
  target[key] = value;
};

/**
 * HTML 속성을 설정하는 함수
 * @param {Element} target - 대상 DOM 요소
 * @param {string} key - 속성명
 * @param {any} value - 속성값
 */
const setHTMLAttribute = (target, key, value) => {
  if (typeof value === "boolean") {
    if (value) {
      target.setAttribute(key, "");
    } else {
      target.removeAttribute(key);
    }
  } else {
    target.setAttribute(key, value);
  }
};

/**
 * 개별 속성을 설정하는 함수
 * @param {Element} target - 대상 DOM 요소
 * @param {string} key - 속성명
 * @param {any} value - 속성값
 */
const setAttribute = (target, key, value) => {
  if (key === CHILDREN_KEY) return;

  if (key.startsWith(EVENT_PREFIX)) {
    registerEventHandler(target, key, value);
    return;
  }

  if (key in target) {
    setDOMProperty(target, key, value);
  } else {
    setHTMLAttribute(target, key, value);
  }
};

/**
 * 새로운 속성들을 설정하는 함수
 * @param {Element} target - 대상 DOM 요소
 * @param {Object} props - 설정할 속성들
 */
const setNewAttributes = (target, props) => {
  if (!props) return;

  for (const [key, value] of Object.entries(props)) {
    setAttribute(target, key, value);
  }
};

/**
 * DOM 요소의 속성을 설정하는 메인 함수
 * @param {Element} target - 대상 DOM 요소
 * @param {Object} props - 새로운 속성들
 * @param {Object} oldProps - 기존 속성들
 */
export const setElementAttributes = (target, props, oldProps = {}) => {
  removeOldAttributes(target, oldProps, props);
  setNewAttributes(target, props);
};
