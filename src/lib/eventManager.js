const eventMap = new WeakMap();
const delegatedEvents = new Set();
let rootElement = null;

/**
 * 컨테이너에 이벤트 리스너를 한 번만 등록합니다.
 *
 * @param {HTMLElement} container - 이벤트 리스너를 등록할 컨테이너 엘리먼트
 */
export function setupEventListeners(container) {
  rootElement = container;
  delegatedEvents.forEach((eventType) => {
    container.removeEventListener(eventType, handleEvent);
    container.addEventListener(eventType, handleEvent);
  });
}

function handleEvent(event) {
  let target = event.target;
  while (target && target !== rootElement) {
    const elementEvents = eventMap.get(target);
    if (elementEvents) {
      const handlers = elementEvents.get(event.type);
      if (handlers) {
        handlers.forEach((handler) => handler(event));
        return;
      }
    }
    target = target.parentElement;
  }
}

/**
 * 특정 엘리먼트에 이벤트 핸들러를 등록합니다.
 *
 * @param {HTMLElement} element - 이벤트를 등록할 엘리먼트
 * @param {string} eventType - 이벤트 타입 (예: 'click')
 * @param {Function} handler - 이벤트 핸들러 함수
 */
export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) {
    eventMap.set(element, new Map());
  }

  const elementEvents = eventMap.get(element);
  if (!elementEvents.has(eventType)) {
    elementEvents.set(eventType, new Set());
  }
  elementEvents.get(eventType).add(handler);

  if (!delegatedEvents.has(eventType)) {
    delegatedEvents.add(eventType);

    if (rootElement) {
      rootElement.removeEventListener(eventType, handleEvent);
      rootElement.addEventListener(eventType, handleEvent);
    }
  }
}

/**
 * 특정 엘리먼트에서 이벤트 핸들러를 제거합니다.
 *
 * @param {HTMLElement} element - 이벤트를 제거할 엘리먼트
 * @param {string} eventType - 이벤트 타입 (예: 'click')
 * @param {Function} handler - 제거할 이벤트 핸들러 함수
 */
export function removeEvent(element, eventType, handler) {
  const elementEvents = eventMap.get(element);
  if (!elementEvents) return;

  const handlers = elementEvents.get(eventType);
  if (!handlers) return;

  handlers.delete(handler);
}
