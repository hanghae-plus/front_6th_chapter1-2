const eventMap = new WeakMap();
const eventTypes = new Set();

export function setupEventListeners(root) {
  eventTypes.forEach((eventType) => {
    root.addEventListener(eventType, (e) => {
      const handler = eventMap.get(e.target)?.[eventType];
      if (handler) {
        handler(e);
      }
    });
  });
}

export function addEvent(element, eventType, handler) {
  const event = eventMap.get(element) || {};
  event[eventType] = handler;
  eventMap.set(element, event);
  eventTypes.add(eventType);
}

export function removeEvent(element, eventType, handler) {
  const event = eventMap.get(element) || {};

  if (event[eventType] === handler) {
    delete event[eventType];
    eventMap.set(element, event);
  }
}
