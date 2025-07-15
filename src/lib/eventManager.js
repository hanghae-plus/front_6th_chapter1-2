// WeakMap<요소, 핸들러> 저장
const eventStore = new Map();
// remove 용 핸들러 저장
const globalHandlers = new Map();

// 이벤트 위임 등록
export function setupEventListeners(root) {
  // 기존 핸들러 제거
  for (const [eventType, handleEvent] of globalHandlers.entries()) {
    root.removeEventListener(eventType, handleEvent);
  }
  globalHandlers.clear();

  for (const [eventType, handlerMap] of eventStore.entries()) {
    const handleEvent = (event) => {
      const target = event.target;
      if (!handlerMap.has(target)) return;

      const handler = handlerMap.get(target);
      if (handler) handler(event);
    };
    root.addEventListener(eventType, handleEvent);
    globalHandlers.set(eventType, handleEvent);
  }
}

// 이벤트 위임 방식으로 등록
export function addEvent(element, eventType, handler) {
  if (!element || typeof handler !== "function") return;

  if (!eventStore.has(eventType)) {
    eventStore.set(eventType, new WeakMap());
  }

  eventStore.get(eventType).set(element, handler);
}

// 이벤트 제거
export function removeEvent(element, eventType, handler) {
  const handlers = eventStore.get(eventType);
  if (!handlers) return;

  if (handlers.get(element) === handler) {
    handlers.delete(element);
  }
}
