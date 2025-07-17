import { toCamelCase } from "../utils/stringUtils.js";
import { createElement } from "./createElement.js";
import { addEvent, removeEvent } from "./eventManager";

function updateAttributes($el, newProps = {}, oldProps = {}) {
  const allKeys = new Set([...Object.keys(newProps || {}), ...Object.keys(oldProps || {})]);

  for (const key of allKeys) {
    const newValue = newProps?.[key];
    const oldValue = oldProps?.[key];

    // className 처리
    if (key === "className") {
      if (newValue) $el.setAttribute("class", newValue);
      else $el.removeAttribute("class");
      continue;
    }

    // checked 처리 (오직 property만)
    if (key === "checked") {
      $el.checked = !!newValue;
      $el.removeAttribute("checked"); // attribute는 무조건 제거
      continue;
    }

    // disabled, readOnly 처리 (항상 removeAttribute로 초기화 후, true일 때만 setAttribute)
    if (key === "disabled" || key === "readOnly") {
      $el[key] = !!newValue;
      $el.removeAttribute(key);
      if (newValue === true) {
        $el.setAttribute(key, "");
      }
      continue;
    }

    // selected는 property만 true/false로, attribute는 항상 제거
    if (key === "selected") {
      $el.selected = !!newValue;
      $el.removeAttribute("selected");
      continue;
    }

    // style 객체 병합
    if (key === "style") {
      $el.style = "";

      if (newValue && typeof newValue === "object") {
        Object.assign($el.style, newValue);
      }

      continue;
    }

    // data-* 속성
    if (key.startsWith("data-")) {
      const dataKey = toCamelCase(key.slice(5));

      if (newValue !== undefined) {
        $el.dataset[dataKey] = newValue;
      } else {
        delete $el.dataset[dataKey];
      }

      continue;
    }

    // 이벤트 핸들러 제거 및 추가
    if (key.startsWith("on") && typeof oldValue === "function") {
      if (!newValue) {
        // old에는 있고 new에는 없으면 제거
        removeEvent($el, key.slice(2).toLowerCase(), oldValue);
      } else if (newValue !== oldValue) {
        // 핸들러가 바뀌었으면 이전 핸들러 제거, 새 핸들러 추가
        removeEvent($el, key.slice(2).toLowerCase(), oldValue);
        addEvent($el, key.slice(2).toLowerCase(), newValue);
      }
      continue;
    }

    if (key.startsWith("on") && typeof newValue === "function" && !oldValue) {
      // old에는 없고 new에만 있으면 추가
      addEvent($el, key.slice(2).toLowerCase(), newValue);
      continue;
    }

    // 일반 속성
    if (newValue !== oldValue) {
      if (newValue == null || newValue === false) {
        $el.removeAttribute(key);
      } else {
        $el.setAttribute(key, newValue);
      }
    }
  }
}

function findDomByKey(parentDom, key) {
  if (!key) return null;

  for (let i = 0; i < parentDom.childNodes.length; i++) {
    const node = parentDom.childNodes[i];
    if (node.__vkey === key) return node;
  }

  return null;
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const childNodes = parentElement.childNodes;
  let currentDom = childNodes[index];

  // key 기반 매칭
  if (newNode && newNode.props && newNode.props.key) {
    const found = findDomByKey(parentElement, newNode.props.key);
    if (found) {
      currentDom = found;
    }
  }

  // 텍스트 노드 처리
  if (typeof newNode === "string" && typeof oldNode === "string") {
    if (newNode !== oldNode) {
      const textNode = document.createTextNode(newNode);
      parentElement.replaceChild(textNode, currentDom);
    }

    return;
  }

  const isVNode = (v) => v && typeof v === "object" && "type" in v;

  // 타입/키가 다르면 교체
  if (
    typeof newNode !== typeof oldNode ||
    (typeof newNode === "string" && typeof oldNode !== "string") ||
    (typeof newNode !== "string" && typeof oldNode === "string") ||
    (isVNode(newNode) &&
      isVNode(oldNode) &&
      (newNode.type !== oldNode.type || newNode.props?.key !== oldNode.props?.key))
  ) {
    const el = typeof newNode === "string" ? document.createTextNode(newNode) : createElement(newNode);

    if (currentDom) {
      parentElement.replaceChild(el, currentDom);
    } else {
      parentElement.appendChild(el);
    }

    return;
  }

  // 둘 다 VNode면 속성만 갱신, 자식 diff
  if (isVNode(newNode) && isVNode(oldNode)) {
    updateAttributes(currentDom, newNode.props, oldNode.props);

    const newChildren = newNode.children || [];
    const oldChildren = oldNode.children || [];
    const minLength = Math.min(newChildren.length, oldChildren.length);

    // 공통 구간은 재귀
    for (let i = 0; i < minLength; i++) {
      updateElement(currentDom, newChildren[i], oldChildren[i], i);
    }

    // 새 자식 append
    for (let i = minLength; i < newChildren.length; i++) {
      const el =
        typeof newChildren[i] === "string" ? document.createTextNode(newChildren[i]) : createElement(newChildren[i]);
      currentDom.appendChild(el);
    }

    // 기존 자식 remove
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      if (currentDom.childNodes[i]) {
        currentDom.removeChild(currentDom.childNodes[i]);
      }
    }
  }
}
