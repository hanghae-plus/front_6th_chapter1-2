const eventRegistry = new Map();

export function setupEventListeners(root) {
  const allEvents = [...eventRegistry.values()].flat();

  const eventTypes = [...new Set(allEvents.map((e) => e.eventType))];

  for (const eventType of eventTypes) {
    root.addEventListener(eventType, (event) => {
      for (const [element, handlers] of eventRegistry) {
        for (const { eventType: type, handler } of handlers) {
          if (type !== eventType) continue;
          if (element.contains(event.target) || element === event.target) {
            handler(event);
          }
        }
      }
    });
  }
}

export function addEvent(element, eventType, handler) {
  if (eventRegistry.has(element)) {
    eventRegistry.get("element").push({ eventType, handler });
  } else {
    eventRegistry.set(element, [{ eventType, handler }]);
  }
}

export function removeEvent(element, eventType, handler) {
  if (!eventRegistry.has(element)) return;

  const handlers = eventRegistry.get(element);
  const index = handlers.findIndex((e) => e.eventType === eventType && e.handler === handler);

  if (index !== -1) {
    handlers.splice(index, 1);

    // 만약 빈 배열이면 Map에서 키 제거 (선택사항)
    if (handlers.length === 0) {
      eventRegistry.delete(element);
    }
  }
}
