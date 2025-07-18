import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

//
// diff 알고리즘 과정
// 이전 Virtual DOM 트리와 새 Virtual DOM 트리를 비교
// 루트 노드에서 시작하여 이전과 새로운 노드를 비교
// 두 노드가 다른 유형이면 새 노드를 만들어 기존 노드를 대체
// 두 노드가 같은 유형이면 속성을 비교하여 변경된 것이 있는지 확인
// 4-1. 변경된 속성이 없으면 바로 사용
// 4-2. 변경된 속성이 있으면 해당 속성을 업데이트
// 자식 노드를 재귀적으로 비교

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const currentNode = parentElement.childNodes[index];

  // 1. oldNode만 있는 경우: 제거
  if (!newNode && oldNode) {
    if (currentNode) {
      parentElement.removeChild(currentNode);
    }
    return;
  }

  // 2. newNode만 있는 경우: 추가
  if (newNode && !oldNode) {
    const newElement = createElement(newNode);
    parentElement.appendChild(newElement);
    return;
  }

  // 3. 텍스트 노드 처리
  if (
    (typeof newNode === "string" || typeof newNode === "number") &&
    (typeof oldNode === "string" || typeof oldNode === "number")
  ) {
    if (newNode !== oldNode) {
      currentNode.textContent = newNode;
    }
    return;
  }

  // 4. 타입이 다른 경우: 교체
  if (newNode?.type !== oldNode?.type) {
    const newElement = createElement(newNode);
    parentElement.replaceChild(newElement, currentNode);
    return;
  }
  // 5. 같은 타입: 속성 업데이트 + 자식 비교
  updateAttributes(currentNode, newNode, oldNode);

  diffChildren(currentNode, newNode, oldNode); // currentNode 전달!
}

function diffChildren(target, newNode, oldNode) {
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  if (oldChildren.length > newChildren.length) {
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      if (target.childNodes[i]) {
        target.removeChild(target.childNodes[i]);
      }
    }
  }
  // 인덱스 기반으로 각 자식 비교
  for (let i = 0; i < maxLength; i++) {
    updateElement(target, newChildren[i], oldChildren[i], i); // index 전달!
  }
}

/**
 *
 * @param {*} target : 업데이트 할 대상 요소
 * @param {*} originNewProps : 새로운 노드의 속성
 * @param {*} originOldProps : 이전 노드의 속성
 */
function updateAttributes(target, originNewProps, originOldProps) {
  const newProps = originNewProps.props || {};
  const oldProps = originOldProps.props || {};

  // 모든 속성 키
  const allKeys = new Set([...Object.keys(newProps), ...Object.keys(oldProps)]);
  // 기존 속성 제거
  // for (const key in oldProps) {
  //   if (!(key in newProps)) {
  //     if (key === "className") {
  //       target.removeAttribute("class");
  //     } else if (key.startsWith("on")) {
  //       const eventType = key.slice(2).toLowerCase();
  //       removeEvent(target, eventType, oldProps[key]);
  //     } else {
  //       target.removeAttribute(key);
  //     }
  //   }
  // }

  // // 새로운 속성 적용
  // for (const key in newProps) {
  //   const newValue = newProps[key];
  //   const oldValue = oldProps[key];

  //   if (newValue !== oldValue) {
  //     if (key === "className") {
  //       target.setAttribute("class", newValue);
  //     } else if (key.startsWith("on") && typeof newValue === "function") {
  //       const eventType = key.slice(2).toLowerCase();
  //       if (oldValue) {
  //         removeEvent(target, eventType, oldValue);
  //       }
  //       addEvent(target, eventType, newValue);
  //     } else if (typeof newValue === "boolean" || newValue === null) {
  //       if (key === "checked" || key === "selected") {
  //         // 특별한 boolean 속성들 처리
  //         // Property만 설정하고 DOM 속성은 제거
  //         if (newValue === null) {
  //           // null이면 기본값으로
  //           target[key] = false;
  //         } else {
  //           target[key] = newValue;
  //         }
  //         target.removeAttribute(key);
  //       } else {
  //         // 일반 boolean 속성들 (disabled, readOnly 등)
  //         if (newValue === null) {
  //           target[key] = false; // null이면 기본값으로
  //           target.removeAttribute(key);
  //         } else {
  //           target[key] = newValue;
  //           if (newValue) {
  //             target.setAttribute(key, "");
  //           } else {
  //             target.removeAttribute(key);
  //           }
  //         }
  //       }
  //     } else if (!key.startsWith("on")) {
  //       // 일반 속성 처리
  //       if (newValue === null || newValue === undefined) {
  //         target.removeAttribute(key);
  //       } else {
  //         target.setAttribute(key, newValue);
  //       }
  //     }
  //   }
  // }

  for (const key of allKeys) {
    const newValue = newProps[key];
    const oldValue = oldProps[key];
    if (newValue === oldValue && !key.startsWith("on")) {
      continue;
    }

    if (key === "className") {
      // target.setAttribute("class", newValue || "");
      if (newValue == null || newValue === "") {
        target.removeAttribute("class");
      } else {
        target.setAttribute("class", newValue);
      }
    } else if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();

      // 기존 이벤트 핸들러 제거
      if (oldValue && typeof oldValue === "function") {
        removeEvent(target, eventType, oldValue);
      }

      // 새로운 이벤트 핸들러 등록
      if (newValue && typeof newValue === "function") {
        addEvent(target, eventType, newValue);
      }
    } else if (typeof newValue === "boolean" || newValue === null) {
      if (key === "checked" || key === "selected") {
        target[key] = newValue === null ? false : newValue;
        target.removeAttribute(key);
      } else {
        target[key] = newValue === null ? false : newValue;
        if (newValue) {
          target.setAttribute(key, "");
        } else {
          target.removeAttribute(key);
        }
      }
    } else if (!key.startsWith("on")) {
      if (newValue === null || newValue === undefined) {
        target.removeAttribute(key);
      } else {
        target.setAttribute(key, newValue);
      }
    }
  }
}
