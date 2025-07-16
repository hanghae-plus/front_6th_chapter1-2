//가비지 컬렉션 되면 자동제거
const eventStore = new Map();

export function setupEventListeners(root) {
  for (const [event, handlers] of eventStore.entries()) {
    root.addEventListener(event, (e) => {
      handlers.forEach(({ element, handler }) => {
        if (element.contains(e.target)) handler(e);
      });
    });
  }
}

export function addEvent(element, eventType, handler) {
  if (!eventStore.has(eventType)) {
    eventStore.set(eventType, new Set());
  }
  eventStore.get(eventType).add({ element, handler });
}

export function removeEvent(element, eventType, handler) {
  const handlers = eventStore.get(eventType);
  if (!handlers) return;

  for (const item of handlers) {
    if (item.element === element && item.handler === handler) {
      handlers.delete(item);
    }
  }

  //메모리 정리
  if (handlers.size === 0) {
    eventStore.delete(eventType);
  }
}
