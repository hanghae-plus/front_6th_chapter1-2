const eventMap = new WeakMap();
const delegatedEvents = new Set();

export function setupEventListeners(root) {
  delegatedEvents.forEach((eventType) => {
    root.addEventListener(eventType, (e) => {
      let target = e.target;

      while (target && target !== root) {
        const elementEvents = eventMap.get(target);

        if (elementEvents) {
          const handlers = elementEvents.get(eventType);

          if (handlers) {
            handlers.forEach((handler) => handler(e));
          }
        }

        target = target.parentNode;
      }
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

  events.get(eventType).add(handler);

  if (!delegatedEvents.has(eventType)) {
    delegatedEvents.add(eventType);
  }
}

export function removeEvent(element, eventType, handler) {
  const events = eventMap.get(element);
  if (!events) return;

  const handlers = events.get(eventType);
  if (!handlers) return;

  handlers.delete(handler);

  if (handlers.size === 0) {
    events.delete(eventType);
  }
  if (events.size === 0) {
    eventMap.delete(element);
  }
}
