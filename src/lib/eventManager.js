const eventMap = new WeakMap();

export function setupEventListeners(root) {
  const eventTypeList = ["click", "input", "change", "submit", "keydown", "keyup", "mouseover", "focus"];
  eventTypeList.forEach((eventType) => {
    root.addEventListener(eventType, (e) => {
      const events = eventMap.get(e.target);
      if (!events) return;
      const handlers = events.get(eventType);
      if (!handlers) return;
      handlers.forEach((handler) => {
        handler(e);
      });
    });
  });
}

export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) {
    eventMap.set(element, new Map());
  }

  const events = eventMap.get(element);
  if (!events.has(eventType)) {
    events.set(eventType, new Set());
  }

  const handlers = events.get(eventType);
  handlers.add(handler);
}

export function removeEvent(element, eventType, handler) {
  const events = eventMap.get(element);
  if (!events) return;

  const handlers = events.get(eventType);
  if (!handlers) return;

  handlers.delete(handler);

  // 핸들러 집합이 비면 eventType 제거
  if (handlers.size === 0) {
    events.delete(eventType);
  }

  // eventType Map도 비었으면 element 자체 제거
  if (events.size === 0) {
    eventMap.delete(element);
  }
}
