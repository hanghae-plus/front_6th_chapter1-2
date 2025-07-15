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

  // 새 이벤트 리스너 등록
  for (const [eventType, handlerMap] of eventStore.entries()) {
    const handleEvent = (event) => {
      let target = event.target;

      // 클릭된 요소와 이벤트가 연결된 요소가 다름
      while (target && target !== event.currentTarget) {
        if (handlerMap.has(target)) {
          // 등록된 이벤트 함수
          const handler = handlerMap.get(target);
          // 실행시킨 후 종료
          if (handler) handler(event);
          break;
        }
        // 부모 요소로 올라가며 반복
        target = target.parentElement;
      }
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
