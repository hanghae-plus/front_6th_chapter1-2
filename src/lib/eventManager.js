const notBubblingEvents = new Set(
  // 버블링이 발생하지 않는 이벤트 필요하다면 추가
  ["focus", "blur"],
);
let eventsRecord = {};

export function setupEventListeners(root) {
  for (const eventType in eventsRecord) {
    if (notBubblingEvents.has(eventType)) {
      // 버블링 이벤트가 아닌 경우, 요소에 이벤트 핸들러를 등록한다.
      eventsRecord[eventType].forEach((handler, element) => {
        element.addEventListener(eventType, handler);
      });
      continue;
    }

    root.addEventListener(eventType, (e) => {
      eventsRecord[eventType].forEach((handler, element) => {
        if (element.contains(e.target)) {
          handler(e);
        }
      });
    });
  }
}

export function addEvent(element, eventType, handler) {
  // eventType 별로 요소-핸들러 쌍을 관리하기 위해 Map을 사용
  eventsRecord[eventType] ??= new Map();

  /**
   * element에 마지막으로 받은 핸들러를 저장.
   * 하나의 요소에서 동일한 타입의 이벤트를 여러개 등록할 수 없기 때문에 항상 덮어 쓴다.
   */
  eventsRecord[eventType].set(element, handler);
}

export function removeEvent(element, eventType) {
  eventsRecord[eventType].delete(element);
  if (!eventsRecord[eventType].size) {
    eventsRecord[eventType] = null;
  }
}
