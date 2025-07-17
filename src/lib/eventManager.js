const eventMap = new Map();

export function setupEventListeners(root) {
  const eventTypes = ["click", "mouseover", "focus", "keydown"];

  eventTypes.forEach((type) => {
    root.addEventListener(type, (e) => {
      const target = e.target;
      const listeners = eventMap.get(target);
      if (listeners && Array.isArray(listeners[type])) {
        listeners[type].forEach((fn) => fn(e));
      }
    });
  });
}

export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) {
    eventMap.set(element, {});
  }

  const listeners = eventMap.get(element);

  if (!Array.isArray(listeners[eventType])) {
    listeners[eventType] = [];
  }

  listeners[eventType].push(handler);
}

export function removeEvent(element, eventType, handler) {
  const listeners = eventMap.get(element);
  if (!listeners || !Array.isArray(listeners[eventType])) return;

  listeners[eventType] = listeners[eventType].filter((fn) => fn !== handler);
}
