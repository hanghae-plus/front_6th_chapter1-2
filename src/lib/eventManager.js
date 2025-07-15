// 객체별 이벤트 저장소
const eventRegistry = new Map();

export function setupEventListeners(root) {
  // 클릭 이벤트 위임
  root.addEventListener("click", (e) => {
    eventRegistry.forEach((eventMap, element) => {
      if (element === e.target) {
        eventMap.forEach((handler) => {
          // 이벤트 실행시 event를 전달
          // e.preventDefault나 e.stopPropagation을 통해 이벤트 전파를 막는 용도
          handler(e);
        });
      }
    });
  });
}

export function addEvent(element, eventType, handler) {
  // 모든 이벤트는 이벤트 위임 방식으로 setupEventListeners에서 처리해야함
  // 해당 이벤트가 없다면 생성
  if (!eventRegistry.has(element)) {
    eventRegistry.set(element, new Map());
  }

  const eventMap = eventRegistry.get(element);
  eventMap.set(eventType, handler);

  return element;
}

// export function removeEvent(element, eventType, handler) {}
