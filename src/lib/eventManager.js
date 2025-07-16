const eventStore = new Map();

export function setupEventListeners(root) {
  for (const [eventType, elementMap] of eventStore.entries()) {
    // eventType(key), elementMap(value)
    root.addEventListener(eventType, (event) => {
      for (const [element, handlers] of elementMap.entries()) {
        // root에 이벤트 타입대로 다 걸어서
        if (element === event.target || element.contains(event.target)) {
          // 위임 체크를 해 주고
          for (const handler of handlers) {
            handler.call(element, event);
          }
        }
      }
    });
  }
}

export function addEvent(element, eventType, handler) {
  if (!eventStore.has(eventType)) {
    // 스토어에 이벤트타입이 없으면 set
    // 내부 맵은 어떤 element에 어떤 handler가 등록되어 있는지를 저장
    eventStore.set(eventType, new Map());
  }

  // eventStore에서 이벤트 타입에 맞는 값을 뽑아온 후
  const elementMap = eventStore.get(eventType);

  // 뽑아오려고 했는데 없으면 set
  if (!elementMap.has(element)) {
    // 핸들러의 중복 방지를 위해 set
    elementMap.set(element, new Set());
  }

  elementMap.get(element).add(handler);
}

export function removeEvent(element, eventType, handler) {
  const elementMap = eventStore.get(eventType); // evenType

  if (!elementMap) return;
  const handlers = elementMap.get(element); // element에 맞는 handler들이 추출됨

  if (!handlers) return;

  // 인자로 받은 핸들러를 삭제
  handlers.delete(handler);

  if (handlers.size === 0) elementMap.delete(element); // 핸들러가 아예 없으면 (element에 등록된 이벤트가 아무것도 없으면) elementMap(eventStore)에서 삭제
  if (elementMap.size === 0) eventStore.delete(eventType); // 이벤트 타입에 등록된 element가 아예 없으면 이벤트 타입 자체를 스토어에서 삭제
}
