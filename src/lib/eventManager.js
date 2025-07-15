const eventMap = new WeakMap();
const delegatedEvents = new Set();
let rootElement = null;

// 컨테이너에 이벤트 위임 리스너 등록
export function setupEventListeners(container) {
  rootElement = container;
  delegatedEvents.forEach((eventType) => {
    container.removeEventListener(eventType, handleEvent);
    container.addEventListener(eventType, handleEvent);
  });
}

// 이벤트 위임 핸들러
function handleEvent(event) {
  let target = event.target;
  while (target && target !== rootElement) {
    // stopPropagation이 호출되면 이벤트 탐색 중단
    if (event.cancelBubble) return;

    const elementEvents = eventMap.get(target);
    if (elementEvents) {
      const handlers = elementEvents.get(event.type);
      if (handlers) {
        handlers.forEach((handler) => handler(event));
        // 핸들러 실행 후 stopPropagation 체크
        if (event.cancelBubble) return;
      }
    }
    target = target.parentElement;
  }
}

// 엘리먼트에 이벤트 등록
export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) eventMap.set(element, new Map());
  const elementEvents = eventMap.get(element);
  if (!elementEvents.has(eventType)) elementEvents.set(eventType, new Set());
  elementEvents.get(eventType).add(handler);

  if (!delegatedEvents.has(eventType)) {
    delegatedEvents.add(eventType);
    if (rootElement) {
      rootElement.removeEventListener(eventType, handleEvent);
      rootElement.addEventListener(eventType, handleEvent);
    }
  }
}

// 엘리먼트에서 이벤트 제거
export function removeEvent(element, eventType, handler) {
  const elementEvents = eventMap.get(element);
  if (!elementEvents) return;
  const handlers = elementEvents.get(eventType);
  if (!handlers) return;
  handlers.delete(handler);
}
