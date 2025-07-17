/**
 * eventListeners (WeakMap) > element (HTMLElement) > eventType (Map) > handler (Set)
 */

const eventListeners = new WeakMap(); // WeakMap<element, Map<eventType, Set<handler>>>
const delegatedEvents = new Set(); // Set<eventType>

export function setupEventListeners(root) {
  delegatedEvents.forEach((eventType) => {
    root.addEventListener(eventType, (event) => {
      let target = event.target;
      while (target && target !== root) {
        const listeners = eventListeners.get(target);
        if (listeners && listeners.has(eventType)) {
          const handlers = listeners.get(eventType);
          handlers.forEach((handler) => {
            handler(event);
          });
          break;
        }
        target = target.parentNode;
      }
    });
  });
}

export function addEvent(element, eventType, handler) {
  if (!eventListeners.has(element)) {
    eventListeners.set(element, new Map());
  }
  const listeners = eventListeners.get(element);
  if (!listeners.has(eventType)) {
    listeners.set(eventType, new Set());
  }
  listeners.get(eventType).add(handler);

  if (!delegatedEvents.has(eventType)) {
    delegatedEvents.add(eventType);
  }
}

export function removeEvent(element, eventType, handler) {
  if (!eventListeners.has(element)) {
    return;
  }

  const listeners = eventListeners.get(element);
  if (!listeners.has(eventType)) {
    return;
  }

  listeners.get(eventType).delete(handler);
  if (listeners.get(eventType).size === 0) {
    listeners.delete(eventType);
  }
  if (listeners.size === 0) {
    eventListeners.delete(element);
  }
}
