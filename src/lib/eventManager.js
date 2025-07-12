const eventTypes = [
  "click",
  "dblclick",
  "mousedown",
  "mouseup",
  "mousemove",
  "keydown",
  "keyup",
  "input",
  "change",
  "focus",
  "blur",
];

const eventMap = new WeakMap();

/**
 * 컨테이너에 이벤트 리스너를 한 번만 등록합니다.
 *
 * @param {HTMLElement} container - 이벤트 리스너를 등록할 컨테이너 엘리먼트
 */
export function setupEventListeners(container) {
  if (container.getAttribute("data-event-listeners") === "true") {
    return;
  }

  eventTypes.forEach((eventType) => {
    container.addEventListener(eventType, (e) => {
      let target = e.target;
      while (target && target !== container) {
        const elementEvents = eventMap.get(target);
        if (elementEvents) {
          const handlers = elementEvents.get(eventType);
          if (handlers) {
            const handlerArray = Array.from(handlers);
            for (const handler of handlerArray) {
              if (typeof handler === "function") {
                handler(e);
                return;
              }
            }
          }
        }
        target = target.parentElement;
      }
    });
  });

  container.setAttribute("data-event-listeners", "true");
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
}
