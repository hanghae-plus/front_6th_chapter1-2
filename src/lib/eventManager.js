const eventStore = new WeakMap();
const eventTypes = new Set();

export function setupEventListeners(root) {
  eventTypes.forEach((eventType) => {
    root.addEventListener(eventType, (e) => {
      let el = e.target;

      while (el && el !== root.parentNode) {
        const eventMap = eventStore.get(el);
        const handlers = eventMap?.get(eventType);

        if (handlers) {
          handlers.forEach((handler) => handler(e));
        }

        el = el.parentNode;
      }
    });
  });
}

export function addEvent(element, eventType, handler) {
  if (!eventStore.has(element)) {
    eventStore.set(element, new Map());
  }

  const eventMap = eventStore.get(element);
  if (!eventMap.has(eventType)) {
    eventMap.set(eventType, new Set());
  }

  eventMap.get(eventType).add(handler);
  eventTypes.add(eventType);
}

export function removeEvent(element, eventType, handler) {
  if (!eventStore.has(element)) return;

  const eventMap = eventStore.get(element);
  const handlerSet = eventMap.get(eventType);

  if (!handlerSet) return;

  handlerSet.delete(handler);

  if (handlerSet.size === 0) {
    eventMap.delete(eventType);
  }

  if (eventMap.size === 0) {
    eventStore.delete(element);
  }
}
