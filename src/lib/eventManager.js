const elementEvents = new Map();
const rootEventTypesMap = new WeakMap();

export function setupEventListeners(root) {
  if (!root) return;

  const existing = rootEventTypesMap.get(root) ?? new Set();

  const allEventTypes = new Set();
  for (const [, typeMap] of elementEvents) {
    for (const eventType of typeMap.keys()) {
      allEventTypes.add(eventType);
    }
  }

  allEventTypes.forEach((eventType) => {
    if (existing.has(eventType)) return;

    const delegatedHandler = (e) => {
      let node = e.target;
      while (node) {
        const typeMap = elementEvents.get(node);
        if (typeMap) {
          const handlers = typeMap.get(eventType);
          if (handlers && handlers.size) {
            [...handlers].forEach((handler) => handler.call(node, e));
          }
        }
        if (node === root) break;
        node = node.parentNode;
      }
    };

    root.addEventListener(eventType, delegatedHandler);
    existing.add(eventType);
  });

  rootEventTypesMap.set(root, existing);
}

export function addEvent(element, eventType, handler) {
  if (!element || !eventType || typeof handler !== "function") return;
  let typeMap = elementEvents.get(element);
  if (!typeMap) {
    typeMap = new Map();
    elementEvents.set(element, typeMap);
  }
  let handlers = typeMap.get(eventType);
  if (!handlers) {
    handlers = new Set();
    typeMap.set(eventType, handlers);
  }
  handlers.add(handler);
}

export function removeEvent(element, eventType, handler) {
  const typeMap = elementEvents.get(element);
  if (!typeMap) return;
  const handlers = typeMap.get(eventType);
  if (!handlers) return;
  handlers.delete(handler);
  if (handlers.size === 0) {
    typeMap.delete(eventType);
  }
  if (typeMap.size === 0) {
    elementEvents.delete(element);
  }
}
