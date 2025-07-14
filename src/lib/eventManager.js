const events = {};

export function setupEventListeners(root) {
  for (const eventType in events) {
    root.addEventListener(eventType, (e) => {
      events[eventType].forEach(({ element, handler }) => {
        if (element.contains(e.target)) {
          handler(e);
        }
      });
    });
  }
}

export function addEvent(element, eventType, handler) {
  events[eventType] ??= new Set();
  events[eventType].add({ element, handler });
}

export function removeEvent(element, eventType, handler) {
  events[eventType]?.forEach((item) => {
    if (item.element === element && item.handler === handler) {
      events[eventType].delete(item);
    }
  });
}
