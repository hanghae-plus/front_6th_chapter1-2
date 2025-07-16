const eventMap = new WeakMap(); // 이벤트 핸들러 저장을 위해 WeakMap 정의
const eventTypes = new Set(); // 등록된 이벤트 타입 순회를 위해 Set 정의
let prevRoot = null; // 렌더링 되어있는 최상위 요소

/**
 * 최상위 요소에 이벤트 리스너를 등록하는 함수
 *
 * @param {HTMLElement} root 이벤트 리스너를 등록할 최상위 요소
 */
export function setupEventListeners(root) {
  prevRoot = root;
  eventTypes.forEach((eventType) => {
    root.removeEventListener(eventType, eventHandler);
    root.addEventListener(eventType, eventHandler);
  });
}

/**
 * 위임받은 이벤트를 처리하는 함수
 *
 * @param {Event} event 이벤트 객체
 */
function eventHandler(event) {
  let target = event.target;

  while (target && target !== prevRoot) {
    const events = eventMap.get(target);

    if (events) {
      const handlers = events[event.type];

      if (handlers) {
        handlers.forEach((handler) => handler(event));
        return;
      }
    }

    target = target.parentElement;
  }
}

/**
 * 요소에 이벤트 핸들러 등록하는 함수
 *
 * @param {HTMLElement} element 이벤트를 등록할 요소
 * @param {string} eventType 이벤트 타입 (click, scroll, mouseover, etc.)
 * @param {function} handler 이벤트 핸들러 함수
 *
 * @example addEvent(element, "click", fn)
 */
export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) {
    eventMap.set(element, {});
  }

  const events = eventMap.get(element);

  if (!events[eventType]) {
    events[eventType] = new Set(); // 하나의 이벤트에 여러 핸들러 등록 가능
  }

  events[eventType].add(handler);

  if (!eventTypes.has(eventType)) {
    eventTypes.add(eventType);
  }
}

/**
 * 요소에 등록된 이벤트 핸들러 제거하는 함수
 *
 * @param {HTMLElement} element 이벤트를 제거할 요소
 * @param {string} eventType 이벤트 타입 (click, scroll, mouseover, etc.)
 * @param {function} handler 이벤트 핸들러 함수
 *
 * @example removeEvent(element, "click", fn)
 */
export function removeEvent(element, eventType, handler) {
  const events = eventMap.get(element);
  if (!events) return;

  const handlers = events[eventType];
  if (!handlers) return;

  handlers.delete(handler);
}
