import { removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";
import { setElementAttributes } from "./setElementAttributes";

// 상수 정의
const CHILDREN_KEY = "children";
const EVENT_PREFIX = "on";

/**
 * 텍스트 노드를 업데이트하는 함수
 * @param {Node} target - 대상 노드
 * @param {string|number} newVNode - 새로운 텍스트 값
 */
const updateTextNode = (target, newVNode) => {
  if (target.nodeType === Node.TEXT_NODE) {
    if (target.textContent !== String(newVNode)) {
      target.textContent = newVNode;
    }
  } else {
    const newTextNode = document.createTextNode(newVNode);
    target.parentNode.replaceChild(newTextNode, target);
  }
};

/**
 * Fragment(배열)를 업데이트하는 함수
 * @param {Element} target - 대상 요소
 * @param {Array} newVNodes - 새로운 vNode 배열
 * @param {Array} oldVNodes - 기존 vNode 배열
 */
const updateFragment = (target, newVNodes, oldVNodes) => {
  const oldNodeLength = oldVNodes?.length ?? 0;
  const newNodeLength = newVNodes.length;
  const maxLength = Math.max(newNodeLength, oldNodeLength);

  // 먼저 제거할 자식들을 역순으로 제거 (인덱스 변경 방지)
  removeExcessChildren(target, newNodeLength, maxLength);
  updateChildren(target, newVNodes, oldVNodes, oldNodeLength);
};

/**
 * 초과된 자식 요소들을 제거하는 함수
 * @param {Element} target - 대상 요소
 * @param {number} newNodeLength - 새로운 자식 개수
 * @param {number} maxLength - 최대 길이
 */
const removeExcessChildren = (target, newNodeLength, maxLength) => {
  for (let i = maxLength - 1; i >= newNodeLength; i--) {
    const targetChild = target.childNodes[i];
    if (targetChild) {
      target.removeChild(targetChild);
    }
  }
};

/**
 * 자식 요소들을 업데이트하는 함수
 * @param {Element} target - 대상 요소
 * @param {Array} newVNodes - 새로운 vNode 배열
 * @param {Array} oldVNodes - 기존 vNode 배열
 * @param {number} oldNodeLength - 기존 자식 개수
 */
const updateChildren = (target, newVNodes, oldVNodes, oldNodeLength) => {
  for (let i = 0; i < newVNodes.length; i++) {
    const newChild = newVNodes[i];
    const oldChild = oldVNodes?.[i];
    const targetChild = target.childNodes[i];

    if (i >= oldNodeLength || !targetChild) {
      // 새 자식이 있지만 기존 자식이 없으면 추가
      const newElement = createElement(newChild);
      if (newElement) {
        target.appendChild(newElement);
      }
    } else {
      // 기존 자식이 있으면 업데이트
      updateElement(targetChild, newChild, oldChild);
    }
  }
};

/**
 * 컴포넌트를 업데이트하는 함수
 * @param {Node} target - 대상 노드
 * @param {Object} newVNode - 새로운 vNode
 * @param {Object} oldVNode - 기존 vNode
 */
const updateComponent = (target, newVNode, oldVNode) => {
  const componentResult = newVNode.type(newVNode.props);
  updateElement(target, componentResult, oldVNode);
};

/**
 * DOM 요소를 업데이트하는 함수
 * @param {Element} target - 대상 요소
 * @param {Object} newVNode - 새로운 vNode
 * @param {Object} oldVNode - 기존 vNode
 */
const updateDOMElement = (target, newVNode, oldVNode) => {
  // 태그가 다르면 교체
  if (target.tagName?.toLowerCase() !== newVNode.type.toLowerCase()) {
    replaceElement(target, newVNode);
    return;
  }

  // 속성 업데이트
  updateAttributes(target, newVNode.props, oldVNode?.props ?? {});

  // 자식 업데이트
  updateFragment(target, newVNode.children, oldVNode?.children);

  // _vNode 속성 업데이트
  target._vNode = newVNode;
};

/**
 * 요소를 새로운 요소로 교체하는 함수
 * @param {Element} target - 교체할 대상 요소
 * @param {Object} newVNode - 새로운 vNode
 */
const replaceElement = (target, newVNode) => {
  const newElement = createElement(newVNode);
  if (newElement && target.parentNode) {
    target.parentNode.replaceChild(newElement, target);
  }
};

/**
 * 요소의 속성을 업데이트하는 함수
 * @param {Element} target - 대상 요소
 * @param {Object} newProps - 새로운 속성들
 * @param {Object} oldProps - 기존 속성들
 */
const updateAttributes = (target, newProps, oldProps) => {
  removeOldEventListeners(target, oldProps);
  setElementAttributes(target, newProps, oldProps);
};

/**
 * 기존 이벤트 리스너들을 제거하는 함수
 * @param {Element} target - 대상 요소
 * @param {Object} oldProps - 기존 속성들
 */
const removeOldEventListeners = (target, oldProps) => {
  for (const [key] of Object.entries(oldProps)) {
    if (key === CHILDREN_KEY) continue;
    if (key.startsWith(EVENT_PREFIX)) {
      const eventType = key.slice(EVENT_PREFIX.length).toLowerCase();
      removeEvent(target, eventType);
    }
  }
};

/**
 * null/undefined vNode를 처리하는 함수
 * @param {Node} target - 대상 노드
 */
const removeNode = (target) => {
  if (target.parentNode) {
    target.parentNode.removeChild(target);
  }
};

/**
 * vNode 타입을 판별하는 함수
 * @param {any} vNode - 판별할 vNode
 * @returns {string} vNode 타입
 */
const getVNodeType = (vNode) => {
  if (typeof vNode === "string" || typeof vNode === "number") {
    return "text";
  }
  if (Array.isArray(vNode)) {
    return "fragment";
  }
  if (Array.isArray(vNode?.type)) {
    return "component";
  }
  if (vNode?.type) {
    return "element";
  }
  return "null";
};

/**
 * vNode 타입별 업데이트 핸들러
 */
const updateHandlers = {
  text: updateTextNode,
  fragment: updateFragment,
  component: updateComponent,
  element: updateDOMElement,
  null: removeNode,
};

/**
 * DOM 요소를 업데이트하는 메인 함수
 * @param {Node} target - 업데이트할 대상 노드
 * @param {any} newVNode - 새로운 vNode
 * @param {any} oldVNode - 기존 vNode
 */
export function updateElement(target, newVNode, oldVNode) {
  const vNodeType = getVNodeType(newVNode);
  const handler = updateHandlers[vNodeType];

  if (handler) {
    handler(target, newVNode, oldVNode);
  } else {
    console.warn(`Unknown vNode type: ${vNodeType}`, newVNode);
  }
}
