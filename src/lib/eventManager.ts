// element별로 이벤트 핸들러를 관리하는 WeakMap
const createEventInstance = () => {
  const elementEventMap = new Map<HTMLElement, Map<keyof HTMLElementEventMap, EventListener>>();

  function removeEvent(element: HTMLElement, eventType: keyof HTMLElementEventMap, handler: EventListener) {
    const eventMap = elementEventMap.get(element);
    if (eventMap) {
      eventMap.delete(eventType);
      if (eventMap.size === 0) {
        elementEventMap.delete(element);
      }
    }
  }

  function addEvent<T extends keyof HTMLElementEventMap>(element: HTMLElement, eventType: T, handler: EventListener) {
    // const eventMap = eventInstanceMap.get(element) || new Map<keyof HTMLElementEventMap, EventListener>();

    const eventMap = new Map<keyof HTMLElementEventMap, EventListener>();

    eventMap.set(eventType, handler);

    elementEventMap.set(element, eventMap);
  }

  // root별로 등록된 이벤트 타입을 추적
  const rootRegisteredTypes = new WeakMap<HTMLElement, Set<string>>();

  function setupEventListeners(root: HTMLElement) {
    if (!rootRegisteredTypes.has(root)) {
      rootRegisteredTypes.set(root, new Set());
    }
    const registeredTypes = rootRegisteredTypes.get(root)!;

    // handlerMap에 등록된 모든 이벤트 타입을 수집
    const eventTypes = new Set<string>();
    for (const eventMap of elementEventMap.values()) {
      for (const type of eventMap.keys()) {
        eventTypes.add(type);
      }
    }

    // 각 이벤트 타입마다 한 번만 리스너 등록
    eventTypes.forEach((type) => {
      if (registeredTypes.has(type)) return;

      registeredTypes.add(type);

      root.addEventListener(type, (event) => {
        let target = event.target as HTMLElement | null;
        for (const [element, eventMap] of elementEventMap.entries()) {
          if (element.contains(target)) {
            const handler = eventMap.get(type as keyof HTMLElementEventMap);
            if (handler) handler.call(element, event);
          }
        }
      });
    });
  }

  return {
    removeEvent,
    addEvent,
    setupEventListeners,
  };
};
export const eventInstance = createEventInstance();

export const { addEvent, removeEvent, setupEventListeners } = eventInstance;
