// eventRegistry : 이벤트 저장소 이벤트 자체를 객체로 사용할 수 있으므로 Map으로 관리
// eventHandlerMap : 어떤 이벤트 핸들러가 저장되어있는지 확인용
const eventRegistry = new Map();
const eventHandlerMap = {};

export function setupEventListeners(root) {
  for (const event in eventRegistry) {
    // 등록되어있는 이벤트가 있다면 먼저 제거
    if (eventRegistry[event]) {
      root.removeEventListener(event, eventHandlerMap[event]);
    }

    // root인 상위 엘리먼트에 이벤트리스너 등록
    const handler = (e) => {
      eventRegistry[event].forEach(({ element, handler }) => {
        if (element.contains(e.target)) {
          handler(e);
        }
      });
    };
    eventHandlerMap[event] = handler;
    root.addEventListener(event, handler);
  }
}

export function addEvent(element, eventType, handler) {
  // 모든 이벤트는 이벤트 위임 방식으로 setupEventListeners에서 처리해야함
  // 해당 이벤트가 없다면 생성
  if (!eventRegistry[eventType]) {
    eventRegistry[eventType] = new Set();
  }
  eventRegistry[eventType].add({ element, handler });
}

export function removeEvent(element, eventType, handler) {
  // 내부 이벤트를 순회하면서 등록되어 있는 이벤트가 있으면 해당 이벤트 삭제
  if (eventRegistry[eventType]) {
    eventRegistry[eventType].forEach((item) => {
      if (item.element === element && item.handler === handler) {
        eventRegistry[eventType].delete(item);
      }
    });
  }
}
