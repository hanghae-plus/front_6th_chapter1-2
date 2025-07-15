const createEventManager = () => {
  const eventStore = new Map();
  const registeredEvents = new Set();
  let rootElement = null;

  return {
    setupEventListeners(root) {
      rootElement = root;

      registeredEvents.forEach((eventType) => {
        root.addEventListener(eventType, (event) => {
          let currentTarget = event.target;
          while (currentTarget && currentTarget !== rootElement) {
            const elementEvents = eventStore.get(currentTarget);
            if (elementEvents && elementEvents.has(eventType)) {
              const handlers = elementEvents.get(eventType);
              handlers.forEach((handler) => handler(event));
            }
            currentTarget = currentTarget.parentElement;
          }
        });
      });
    },

    addEvent(element, eventType, handler) {
      registeredEvents.add(eventType);

      if (eventStore.has(element)) {
        const elementEvent = eventStore.get(element);
        if (elementEvent.has(eventType)) {
          const handlers = elementEvent.get(eventType);
          handlers.add(handler);
        } else {
          const newHandlerSet = new Set();
          newHandlerSet.add(handler);
          elementEvent.set(eventType, newHandlerSet);
        }
      } else {
        const newElementEvent = new Map();
        const newHandlerSet = new Set();
        newHandlerSet.add(handler);
        newElementEvent.set(eventType, newHandlerSet);
        eventStore.set(element, newElementEvent);
      }
    },

    removeEvent(element, eventType, handler) {
      const elementEvents = eventStore.get(element);
      if (elementEvents && elementEvents.has(eventType)) {
        const handlers = elementEvents.get(eventType);
        handlers.delete(handler);
        if (handlers.size === 0) elementEvents.delete(eventType);
        if (elementEvents.size === 0) eventStore.delete(element);
      }
    },
  };
};

const eventManager = createEventManager();

export const { setupEventListeners, addEvent, removeEvent } = eventManager;
