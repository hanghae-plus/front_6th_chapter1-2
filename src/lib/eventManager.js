/*
* WeakMap<Element, Map<string, Set<Function>>> 형태
* DOM 요소를 키로 가지고, 값으로는 또 다른 Map을 가집니다. 이 내부 Map은 이벤트 타입(문자열, 예: 'click')을 키로 가지고,
  값으로는 해당 이벤트 타입에 등록된 핸들러 함수들의 Set을 가집니다.
* */
const delegatedMap = new WeakMap();
// 변수 선언
let eventRoot = null;
// 이벤트 타입
const DELEGATED_EVENTS = ["click", "input", "change", "keydown", "mouseover", "focus"];

function handleDelegateEvent(event) {
  let currentElement = event.target;
  while (currentElement && currentElement !== eventRoot.parentElement) {
    if (delegatedMap.has(currentElement)) {
      const eventTypeMap = delegatedMap.get(currentElement);
      if (eventTypeMap.has(event.type)) {
        const handlers = eventTypeMap.get(event.type);
        for (const handlerElement of handlers) {
          handlerElement(event);
          event.stopPropagation();
          if (event.cancelBubble) {
            return;
          }
        }
      }
    }
    currentElement = currentElement.parentElement;
  }
}
// root 인자로 받은 DOM 요소에 이벤트 리스너를 등록
export function setupEventListeners(root) {
  if (eventRoot === root) {
    return;
  }

  if (eventRoot) {
    DELEGATED_EVENTS.forEach((eventType) => {
      root.addEventListener(eventType, handleDelegateEvent);
    });
  }
  eventRoot = root;

  DELEGATED_EVENTS.forEach((eventType) => {
    root.addEventListener(eventType, handleDelegateEvent);
  });
}
//특정 DOM element에 eventType의 handler 함수를 "등록"하는 역할
export function addEvent(element, eventType, handler) {
  if (!delegatedMap.has(element)) {
    delegatedMap.set(element, new Map());
  }

  const eventTypeMap = delegatedMap.get(element);
  if (!eventTypeMap.has(eventType)) {
    eventTypeMap.set(eventType, new Set());
  }
  const handlers = eventTypeMap.get(eventType);
  handlers.add(handler);
}

export function removeEvent(element, eventType, handler) {
  if (!delegatedMap.has(element)) {
    return;
  }
  const eventTypeMap = delegatedMap.get(element);
  if (!eventTypeMap.has(eventType)) {
    return;
  }
  const handlers = eventTypeMap.get(eventType);
  handlers.delete(handler);

  if (handlers.size === 0) {
    eventTypeMap.delete(eventType);
  }

  if (eventTypeMap.size === 0) {
    delegatedMap.delete(element);
  }
}
