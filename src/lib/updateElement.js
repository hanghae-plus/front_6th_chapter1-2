import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

/**
 * DOM Element의 속성을 비교하여 업데이트하는 함수
 * 1단계: 이전 속성들 정리/제거
 * 2단계: 새로운 속성들 설정
 *
 * @param {HTMLElement} element - 업데이트할 DOM Element
 * @param {Object} newProps - 새로운 속성들
 * @param {Object} oldProps - 이전 속성들
 */
export function updateAttributes(element, newProps, oldProps = null) {
  // 둘 다 없으면 처리할 것이 없음
  if (!newProps && !oldProps) return;

  // === 1단계: 이전 속성들 정리 ===
  // 제거되거나 변경된 속성들을 먼저 정리
  if (oldProps) {
    Object.keys(oldProps).forEach((key) => {
      // children은 별도 처리되므로 스킵
      if (key === "children") return;

      if (key.startsWith("on")) {
        // 이벤트 핸들러: 무조건 이전 핸들러 제거 (새 핸들러로 교체하기 위해)
        const eventType = key.slice(2).toLowerCase();
        removeEvent(element, eventType, oldProps[key]);
      } else if (!newProps || !(key in newProps)) {
        // 새 속성에 없는 경우: 속성 완전 제거
        if (key === "className") {
          element.removeAttribute("class");
        } else if (typeof element[key] === "boolean") {
          // 불린 속성: 프로퍼티와 어트리뷰트 모두 제거
          element[key] = false;
          element.removeAttribute(key);
        } else {
          // 일반 속성: 어트리뷰트 제거
          element.removeAttribute(key);
        }
      }
    });
  }

  // 새로운 속성들 설정
  if (newProps) {
    Object.entries(newProps).forEach(([key, value]) => {
      // children은 별도 처리되므로 스킵
      if (key === "children") return;

      // className 특별 처리: class 어트리뷰트로 설정
      if (key === "className") {
        if (value) {
          element.setAttribute("class", value);
        } else {
          element.removeAttribute("class");
        }
        return;
      }

      if (key.startsWith("on")) {
        // 이벤트 핸들러: 이벤트 위임 시스템에 등록
        const eventType = key.slice(2).toLowerCase();
        addEvent(element, eventType, value);
        return;
      }

      if (typeof element[key] === "boolean") {
        // 불린 속성: 프로퍼티로 설정 (true/false)
        element[key] = Boolean(value);
        return;
      }

      if (value != null) {
        // 일반 속성: 어트리뷰트로 설정
        element.setAttribute(key, String(value));
      }
    });
  }
}

/**
 * 가상 DOM의 diff 알고리즘을 통해 실제 DOM을 효율적으로 업데이트합니다.
 *
 * @param {HTMLElement} parentElement - 업데이트할 부모 DOM 엘리먼트
 * @param {any} newNode - 새로운 가상 노드(VNode) 또는 문자열/숫자
 * @param {any} oldNode - 이전 가상 노드(VNode) 또는 문자열/숫자
 * @param {number} [index=0] - 부모 엘리먼트 내에서의 자식 인덱스
 */
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  //현재 자식 노드
  const currentChild = parentElement.childNodes[index];

  // 케이스 1: 새로운 노드가 없고 이전 노드가 있으면 제거
  if (!newNode && oldNode) {
    if (currentChild) {
      parentElement.removeChild(currentChild);
    }
    return;
  }

  // 케이스 2: 새로운 노드가 있고 이전 노드가 없으면 추가
  if (newNode && !oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  // 케이스 3: 텍스트/숫자 노드 업데이트
  // 값이 같지 않은 경우, 변경된 부분만 업데이트
  if (typeof newNode === "string" || typeof newNode === "number") {
    if (newNode !== oldNode) {
      const newTextNode = document.createTextNode(String(newNode));
      if (currentChild) {
        parentElement.replaceChild(newTextNode, currentChild);
      } else {
        parentElement.appendChild(newTextNode);
      }
    }
    return;
  }

  // 케이스 4: 다른 타입 엘리먼트 (완전 교체)
  if (newNode.type !== oldNode.type) {
    const newElement = createElement(newNode);
    if (currentChild) {
      parentElement.replaceChild(newElement, currentChild);
    } else {
      parentElement.appendChild(newElement);
    }
    return;
  }

  // 케이스 5: 같은 타입 엘리먼트인 경우 (속성 및 자식 업데이트)
  if (currentChild) {
    // 속성 업데이트
    updateAttributes(currentChild, newNode.props || {}, oldNode.props || {});

    // 자식 노드들 업데이트
    updateChildren(currentChild, newNode.children || [], oldNode.children || []);
  }
}

/**
 * 자식 노드들을 효율적으로 업데이트하는 함수
 * @param {HTMLElement} parentElement - 부모 엘리먼트
 * @param {Array} newChildren - 새로운 자식 노드들
 * @param {Array} oldChildren - 이전 자식 노드들
 */
function updateChildren(parentElement, newChildren, oldChildren) {
  // 둘 중 길이가 더 긴 쪽으로 업데이트
  // 자식이 추가되거나 제거되는 경우 모두 처리 위한 최대 길이 계산
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  // 각 자식 노드 순차적으로 업데이트
  for (let i = 0; i < maxLength; i++) {
    updateElement(parentElement, newChildren[i], oldChildren[i], i);
  }

  // 남은 자식 노드들 제거 (역순으로 제거하여 인덱스 문제 방지)
  if (oldChildren.length > newChildren.length) {
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      const extraChild = parentElement.childNodes[i];
      if (extraChild) {
        parentElement.removeChild(extraChild);
      }
    }
  }
}
