const eventTypes = [];
const elementMap = new Map();

// 실제 이벤트 발생
const handleEvent = (e) => {
  const handlerMap = elementMap.get(e.target);
  const handler = handlerMap?.get(e.type);
  // 실행
  if (handler) handler.call(e.target, e);
};

export function setupEventListeners(root) {
  eventTypes.forEach((eventType) => {
    root.addEventListener(eventType, handleEvent);
  });
}

export function addEvent(element, eventType, handler) {
  if (!eventTypes.includes(eventType)) eventTypes.push(eventType);
  const handlerMap = elementMap.get(element) || new Map();
  if (handlerMap.get(eventType) === handler) return;
  handlerMap.set(eventType, handler);
  elementMap.set(element, handlerMap);
}

export function removeEvent(element, eventType, handler) {
  const handlerMap = elementMap.get(element);
  if (!handlerMap) return;

  if (handlerMap.get(eventType) === handler) handlerMap.delete(eventType);

  if (handlerMap.size === 0) elementMap.delete(element);
  else elementMap.set(element, handlerMap);
}
