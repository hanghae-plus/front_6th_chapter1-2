import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(dom, newProps = {}, oldProps = {}) {
  // 새 props 추가 또는 변경
  for (const key in newProps) {
    const newVal = newProps[key];
    const oldVal = oldProps[key];

    if (newVal !== oldVal) {
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase();

        // 기존 핸들러 제거
        if (typeof oldVal === "function") {
          removeEvent(dom, eventType, oldVal);
        }

        // 새 핸들러 등록
        if (typeof newVal === "function") {
          addEvent(dom, eventType, newVal);
        }
      } else if (key === "className") {
        dom.setAttribute("class", newVal);
      } else {
        dom[key] = newVal;
      }
    }
  }

  // 제거된 props 처리
  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (key.startsWith("on") && typeof oldProps[key] === "function") {
        const eventType = key.slice(2).toLowerCase();
        removeEvent(dom, eventType, oldProps[key]);
      } else if (key === "className") {
        dom.removeAttribute("class");
      } else {
        dom[key] = undefined;
      }
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const existingDom = parentElement.childNodes[index];

  // 1. oldNode가 없으면 새로 추가
  if (!oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  // 2. newNode가 없으면 기존 DOM 제거
  if (!newNode) {
    if (existingDom) parentElement.removeChild(existingDom);
    return;
  }

  // 3. 타입이 다르면 교체
  if (
    typeof newNode !== typeof oldNode ||
    (typeof newNode === "string" && newNode !== oldNode) ||
    (newNode.type && newNode.type !== oldNode.type)
  ) {
    parentElement.replaceChild(createElement(newNode), existingDom);
    return;
  }

  // 4. 텍스트 노드면 내용만 업데이트
  if (typeof newNode === "string") {
    if (existingDom.textContent !== newNode) {
      existingDom.textContent = newNode;
    }
    return;
  }

  // 5. props 업데이트
  updateAttributes(existingDom, newNode.props || {}, oldNode.props || {});

  // 6. 자식 노드 재귀적으로 diff
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const max = Math.max(newChildren.length, oldChildren.length);

  // 7. oldChildren이 더 많으면 초과된 노드 제거
  if (oldChildren.length > newChildren.length) {
    for (let i = newChildren.length; i < oldChildren.length; i++) {
      const childDom = existingDom.childNodes[i];
      if (childDom) {
        existingDom.removeChild(childDom);
      }
    }
  }

  for (let i = 0; i < max; i++) {
    updateElement(existingDom, newChildren[i], oldChildren[i], i);
  }

  // 초과된 자식 DOM 제거
  while (existingDom.childNodes.length > newChildren.length) {
    existingDom.removeChild(existingDom.lastChild);
  }
}

// export function updateElement(parentElement, newNode, oldNode, index = 0) {
//   const existingDom = parentElement.childNodes[index];

//   // 1. oldNode가 없으면 새로 추가
//   if (!oldNode) {
//     parentElement.appendChild(createElement(newNode));
//     return;
//   }

//   // 2. newNode가 없으면 기존 DOM 제거
//   if (!newNode) {
//     if (existingDom) parentElement.removeChild(existingDom);
//     return;
//   }

//   // 3. 타입(태그/텍스트)이 다르면 교체
//   if (
//     typeof newNode !== typeof oldNode ||
//     (typeof newNode === "string" && newNode !== oldNode) ||
//     (newNode.type && newNode.type !== oldNode.type)
//   ) {
//     parentElement.replaceChild(createElement(newNode), existingDom);
//     return;
//   }

//   // 4. 텍스트 노드면 내용만 업데이트
//   if (typeof newNode === "string") {
//     if (existingDom.textContent !== newNode) {
//       existingDom.textContent = newNode;
//     }
//     return;
//   }

//   // 5. props 업데이트
//   updateProps(existingDom, newNode.props, oldNode.props);

//   // 6. 자식 노드 재귀적으로 diff
//   const newChildren = newNode.children || [];
//   const oldChildren = oldNode.children || [];
//   const max = Math.max(newChildren.length, oldChildren.length);

//   for (let i = 0; i < max; i++) {
//     updateElement(existingDom, newChildren[i], oldChildren[i], i);
//   }
// }
