// element -> eventType -> Set(handlers)
// WeakMap 은 메모리 누수 방지 & 은밀하게 데이터를 저장하고 싶을 떄
const eventMap = new WeakMap();

// export function setupEventListeners(root) {}

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

export function removeEvent(element, eventType, handler) {
    const elementEvents = eventMap.get(element);
    if (!elementEvents) return;

    const handlers = elementEvents.get(eventType);
    if (!handlers) return;

    handlers.delete(handler);
}
