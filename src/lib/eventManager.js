const handlerMap = new WeakMap();
const registeredTypes = new Set();
let root = null;

function handlerEvent(event) {
  let el = event.target;
  while (el && el !== root) {
    const handlers = handlerMap.get(el);
    if (handlers) {
      // 1) event.type 으로 실제 등록된 핸들러 셋을 꺼내고
      const eventHandlers = handlers.get(event.type);
      // 2) 핸들러가 있는 경우에만 forEach 호출
      if (eventHandlers) {
        eventHandlers.forEach((handler) => handler(event));
        return;
      }
    }
    el = el.parentNode;
  }
}

export function setupEventListeners(container) {
  root = container;
  registeredTypes.forEach((eventType) => {
    container.removeEventListener(eventType, handlerEvent);
    container.addEventListener(eventType, handlerEvent);
  });
}

export function addEvent(element, eventType, handler) {
  if (!handlerMap.has(element)) {
    handlerMap.set(element, new Map());
  }

  const elementEvents = handlerMap.get(element);
  if (!elementEvents.has(eventType)) {
    elementEvents.set(eventType, new Set());
  }

  elementEvents.get(eventType).add(handler);

  if (!registeredTypes.has(eventType)) {
    registeredTypes.add(eventType);

    if (root) {
      root.removeEventListener(eventType, handlerEvent);
      root.addEventListener(eventType, handlerEvent);
    }
  }
}

export function removeEvent(element, eventType, handler) {
  const elementEvents = handlerMap.get(element);
  // 2) 해당 이벤트 타입이 없으면 종료
  if (!elementEvents.has(eventType)) {
    return;
  }

  const handlers = elementEvents.get(eventType);
  // 3) 특정 핸들러만 제거
  handlers.delete(handler);

  // (선택) 핸들러 집합이 비었으면 이벤트 타입 자체를 삭제
  if (handlers.size === 0) {
    elementEvents.delete(eventType);
  }
}
