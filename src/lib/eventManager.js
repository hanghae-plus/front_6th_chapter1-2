/**
 * 효율적인 이벤트 관리를 위한 이벤트 위임 시스템
 */

// 이벤트 핸들러를 저장하는 WeakMap (메모리 누수 방지)
const eventMap = new WeakMap();

/**
 * 루트 요소에 이벤트 위임 리스너를 설정
 * @param {HTMLElement} root - 이벤트 위임을 설정할 루트 요소
 */

// type 으로 묶어서 공통함수로 빼서 처리 해보자.
// -> 이렇게 공통 함수로 묶어 보았다.
function delegate(root, eventType, handlerKey, options) {
  root.addEventListener(
    eventType,
    (e) => {
      // 이벤트 버블링을 고려하여 상위 요소들도 확인
      let target = e.target;
      while (target && target !== root) {
        const handlers = eventMap.get(target);
        if (handlers && handlers[handlerKey]) {
          handlers[handlerKey](e);
          return; // 핸들러를 찾으면 더 이상 상위로 올라가지 않음
        }
        target = target.parentElement;
      }
    },
    options,
  );
}

export function setupEventListeners(root) {
  // 클릭 이벤트 위임
  delegate(root, "click", "click");
  // 인풋 이벤트 위임
  delegate(root, "input", "input");
  // 체인지 이벤트 위임
  delegate(root, "change", "change");
  // 마우스오버 이벤트 위임
  delegate(root, "mouseover", "mouseover");
  // 포커스 이벤트 위임
  delegate(root, "focus", "focus", true); // capture 옵션 필요
  // 키다운 이벤트 위임
  delegate(root, "keydown", "keydown");
  // 서브밋 이벤트 위임
  delegate(root, "submit", "submit");
}

/**
 * 특정 요소에 이벤트 핸들러를 등록 (위임 방식)
 * @param {HTMLElement} element - 이벤트를 등록할 요소
 * @param {string} eventType - 이벤트 타입
 * @param {Function} handler - 이벤트 핸들러 함수
 */
export function addEvent(element, eventType, handler) {
  // WeakMap에 해당 요소의 핸들러 저장
  if (!eventMap.has(element)) {
    eventMap.set(element, {});
  }
  eventMap.get(element)[eventType] = handler;
}

/**
 * 특정 요소의 이벤트 핸들러를 제거 (위임 방식)
 * @param {HTMLElement} element - 이벤트를 제거할 요소
 * @param {string} eventType - 이벤트 타입
 * @param {Function} handler - 제거할 핸들러 함수 (위임 방식에서는 미사용)
 */
// eslint-disable-next-line no-unused-vars
export function removeEvent(element, eventType, handler) {
  const handlers = eventMap.get(element);
  if (handlers && handlers[eventType]) {
    delete handlers[eventType];

    // 해당 요소에 핸들러가 더 이상 없으면 WeakMap에서 제거
    if (Object.keys(handlers).length === 0) {
      eventMap.delete(element);
    }
  }
}
