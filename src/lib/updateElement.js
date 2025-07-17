import { addEvent, removeEvent } from "./eventManager.js";
import { createElement } from "./createElement.js";

const BOOLEAN_PROPS = ["checked", "disabled", "selected", "readOnly"];

/**
 * DOM 요소로부터 속성(props) 객체를 추출합니다.
 * 'class'는 'className'으로 변환하고, BOOLEAN_PROPS에 해당하는 프로퍼티도 포함합니다.
 * @param {HTMLElement} el - 속성을 가져올 DOM 요소
 * @returns {object} - 요소의 속성을 담은 객체
 */
const getProps = (el) => {
  const props = {};
  if (!el || el.nodeType !== 1) return props;
  for (const attr of el.getAttributeNames()) {
    props[attr === "class" ? "className" : attr] = el.getAttribute(attr);
  }
  for (const key of BOOLEAN_PROPS) {
    if (key in el) props[key] = el[key];
  }
  return props;
};

/**
 * 'on'으로 시작하는 prop 키를 소문자 이벤트 이름으로 변환합니다. (예: 'onClick' -> 'click')
 * @param {string} key - 이벤트 핸들러 prop의 키
 * @returns {string} - 변환된 소문자 이벤트 이름
 */
const getEventName = (key) => key.slice(2).toLowerCase();

/**
 * DOM 요소의 속성을 업데이트(패치)합니다.
 * 이전 속성과 새 속성을 비교하여 변경된 부분만 추가, 수정, 또는 제거합니다.
 * @param {HTMLElement} el - 속성을 업데이트할 DOM 요소
 * @param {object} [newProps={}] - 적용할 새로운 속성 객체
 * @param {object} [oldProps={}] - 비교할 이전 속성 객체
 */
const updateAttributes = (el, newProps = {}, oldProps = {}) => {
  // 오래된 속성 제거
  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (key.startsWith("on") && typeof oldProps[key] === "function") {
        removeEvent(el, getEventName(key), oldProps[key]);
      } else if (key === "className") {
        el.removeAttribute("class");
      } else if (BOOLEAN_PROPS.includes(key)) {
        el[key] = false;
      } else {
        el.removeAttribute(key);
      }
    }
  }
  // 새 속성 추가/업데이트
  for (const key in newProps) {
    const value = newProps[key];
    const oldValue = oldProps[key];

    if (value === oldValue) {
      continue;
    }

    // 이벤트 핸들러 추가/제거
    if (key.startsWith("on") && typeof value === "function") {
      if (typeof oldValue === "function") {
        removeEvent(el, getEventName(key), oldValue);
      }
      addEvent(el, getEventName(key), value);
    } else if (key === "className") {
      if (value) {
        el.setAttribute("class", value);
      } else {
        el.removeAttribute("class");
      }
    } else if (BOOLEAN_PROPS.includes(key)) {
      el[key] = !!value;
    } else {
      if (value === null || value === false) {
        el.removeAttribute(key);
      } else {
        el.setAttribute(key, value);
      }
    }
  }
};

/**
 * 가상 DOM 노드를 실제 DOM에 재귀적으로 반영합니다.
 * 새 가상 노드와 이전 가상 노드를 비교하여 실제 DOM을 최소한으로 변경합니다.
 * @param {HTMLElement} parent - 부모 DOM 요소.
 * @param {object|string|number|null} newVNode - 새로운 가상 노드. null이면 domEl을 제거
 * @param {HTMLElement|Text|undefined} domEl - 현재 DOM에 있는 실제 요소. undefined이면 새 노드를 추가
 * @param {object|null} [prevVNode=null] - domEl에 해당하는 이전 가상 노드
 */
export const updateElement = (parent, newVNode, domEl, prevVNode = null) => {
  // 새 노드만 있으면 추가
  if (!domEl) {
    if (newVNode != null) {
      parent.appendChild(createElement(newVNode));
    }
    return;
  }
  // 새 노드가 없으면 삭제
  if (newVNode == null) {
    parent.removeChild(domEl);
    return;
  }
  // 텍스트 노드 처리
  if (typeof newVNode === "string" || typeof newVNode === "number") {
    if (domEl.nodeType !== Node.TEXT_NODE) {
      parent.replaceChild(document.createTextNode(newVNode), domEl);
    } else if (domEl.textContent !== String(newVNode)) {
      domEl.textContent = newVNode;
    }
    return;
  }
  // 기존이 텍스트 노드면 교체
  if (domEl.nodeType === Node.TEXT_NODE) {
    parent.replaceChild(createElement(newVNode), domEl);
    return;
  }
  // 타입이 다르면 교체
  if (newVNode.type !== domEl.nodeName.toLowerCase()) {
    // 이벤트 핸들러 정리
    const oldProps = getProps(domEl);
    for (const key in oldProps) {
      if (key.startsWith("on") && typeof oldProps[key] === "function") {
        removeEvent(domEl, getEventName(key), oldProps[key]);
      }
    }
    parent.replaceChild(createElement(newVNode), domEl);
    return;
  }
  // 속성 patch
  const oldProps = prevVNode?.props ?? getProps(domEl);
  updateAttributes(domEl, newVNode.props ?? {}, oldProps);

  // 자식 patch
  const newChildren = newVNode.children ?? [];
  const oldChildNodes = Array.from(domEl.childNodes);
  const oldChildren = prevVNode?.children ?? [];
  const maxLen = Math.max(newChildren.length, oldChildNodes.length);

  for (let i = 0; i < maxLen; i++) {
    const prevChildVNode = oldChildren[i] ?? null;
    const newChildVNode = newChildren[i];
    const childDom = domEl.childNodes[i];

    if (newChildVNode == null && childDom) {
      domEl.removeChild(childDom);
      continue;
    }
    updateElement(domEl, newChildVNode, childDom, prevChildVNode);
  }
  // 남은 노드 정리
  while (domEl.childNodes.length > newChildren.length) {
    const oldChildDom = domEl.childNodes[newChildren.length];

    if (oldChildDom) {
      const oldChildProps = getProps(oldChildDom);
      for (const key in oldChildProps) {
        if (key.startsWith("on") && typeof oldChildProps[key] === "function") {
          removeEvent(oldChildDom, getEventName(key), oldChildProps[key]);
        }
      }
    }
    domEl.removeChild(domEl.lastChild);
  }
};
