const eventRegistry = [];

export function setupEventListeners(root) {
  const eventTypes = [...new Set(eventRegistry.map((e) => e.eventType))];

  for (const eventType of eventTypes) {
    root.addEventListener(eventType, (event) => {
      for (const { element, eventType: type, handler } of eventRegistry) {
        if (type !== eventType) continue;
        if (element.contains(event.target) || element === event.target) {
          handler(event);
        }
      }
    });
  }
}

export function addEvent(element, eventType, handler) {
  eventRegistry.push({ element, eventType, handler });
}

export function removeEvent(element, eventType, handler) {
  const index = eventRegistry.findIndex(
    (e) => e.element === element && e.eventType === eventType && e.handler === handler,
  );
  if (index !== -1) {
    eventRegistry.splice(index, 1);
  }
}
