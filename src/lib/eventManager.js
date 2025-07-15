// element -> eventType -> Set(handlers)
// WeakMap 은 메모리 누수 방지용
const eventMap = new WeakMap();
const delegatedEvents = new Set();
let rootElement = null;

export function setupEventListeners(container) {
    rootElement = container;
    delegatedEvents.forEach((eventType) => {
        // handleEvent 를 풀어 쓰자면... (event) => handleEvent(event)
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

export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) {
    eventMap.set(element, new Map());
  }

  const elementEvents = eventMap.get(element);
  if (!elementEvents.has(eventType)) {
    elementEvents.set(eventType, new Set());
  }

  elementEvents.get(eventType).add(handler);
  /**
   * elementEvents 형태
   * Map(1) {
   *    'click' => Set(1) {
   *        [Function: spy] {
   *            getMockName: [Function (anonymous)],
   *            mockName: [Function (anonymous)],
   *            ... 
  */

  if (!delegatedEvents.has(eventType)) {
    delegatedEvents.add(eventType);

    if (rootElement) {
        rootElement.removeEventListener(eventType, handleEvent);
        rootElement.addEventListener(eventType, handleEvent);
    }
  }
}

export function removeEvent(element, eventType, handler) {
  const elementEvents = eventMap.get(element);
  if (!elementEvents) return;

  const handlers = elementEvents.get(eventType);
  if (!handlers) return;

  handlers.delete(handler);
}
