// 전역 이벤트 저장소
const eventStore = new Map();

// 렌더링 후 전역 이벤트 등록
export function setupEventListeners(root) {
  for (const eventType in eventStore) {
    if (eventStore.has(eventType)) continue;

    const handleEvent = (event) => {
      // WeakMap 객체
      const handlerMap = eventStore[event.type];
      // 이벤트 발생 요소
      const target = event.target;

      if (!handlerMap || !handlerMap.has(target)) return;

      const handler = handlerMap.get(target);
      handler(event);
    };

    root.addEventListener(eventType, handleEvent);
    eventStore.set(eventType, handleEvent);
  }
}

// 이벤트 위임 - 이벤트 저장 및 등록
export function addEvent(element, eventType, handler) {
  if (!element || typeof handler != "function") return;

  eventStore[eventType] = eventStore[eventType] || new WeakMap();
  eventStore[eventType].set(element, handler);
}

// 전역 상태의 이벤트 삭제
export function removeEvent(element, eventType, handler) {
  if (eventStore[eventType].get(element) === handler) {
    eventStore[eventType].delete(element);
  }
}
