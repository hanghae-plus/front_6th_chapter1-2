const eventTypes = new Set(); // 등록된 이벤트 타입 순회를 위해 Set 정의
const eventMap = new WeakMap(); // 이벤트 핸들러 저장을 위해 WeakMap 정의

// export function setupEventListeners(root) {}

export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) {
    eventMap.set(element, {});
  }

  eventMap.get(element)[eventType] = handler;
  eventTypes.add(eventType);
}

export function removeEvent(element, eventType, handler) {
  if (!eventMap.has(element)) return;

  const handlers = eventMap.get(element);
  delete handlers[eventType];
  element.removeEventListener(eventType, handler);
}
