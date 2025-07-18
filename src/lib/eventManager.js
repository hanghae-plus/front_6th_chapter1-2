// // 1. test 실패

// // 두번 클릭이 되는듯
// 맵,셋,위크맵

// 맵은 키가 중복 될수 없으므로, 이벤트 헨들러를 저장하는게 좋음

// 이벤트 핸들러와 리스너를 관리하는 구조
let eventHandlers = new Set();
const delegatedRoot = new Map(); // root와 해당 리스너 함수들을 저장

export function setupEventListeners(root) {
  if (!root) return;

  // 기존 이벤트 리스너들 제거
  if (delegatedRoot.has(root)) {
    const existingListeners = delegatedRoot.get(root);
    existingListeners.forEach(({ eventType, listener }) => {
      root.removeEventListener(eventType, listener);
    });
    delegatedRoot.delete(root);
  }

  // 이벤트 타입들을 모아서 중복 방지
  const eventTypes = new Set();
  eventHandlers.forEach(({ eventType }) => {
    eventTypes.add(eventType);
  });

  // 새로운 리스너들 저장
  const newListeners = [];

  // 이벤트타입별로 리스너 등록
  eventTypes.forEach((eventType) => {
    const listener = (e) => {
      eventHandlers.forEach(({ element, handler, eventType: handlerEventType }) => {
        if (handlerEventType === eventType && (element === e.target || element.contains(e.target))) {
          handler(e);
        }
      });
    };

    root.addEventListener(eventType, listener);
    newListeners.push({ eventType, listener });
  });

  // 새로운 리스너들을 맵에 저장
  delegatedRoot.set(root, newListeners);
}

// 이벤트 핸들러를 저장 등록
export function addEvent(element, eventType, handler) {
  if (!element || !eventType || !handler) return;

  // 중복 핸들러 방지 - 같은 요소, 같은 이벤트 타입의 기존 핸들러 제거
  // eventHandlers.forEach((item) => {
  //   if (item.element === element && item.eventType === eventType) {
  //     eventHandlers.delete(item);
  //   }
  // });

  eventHandlers.add({ element, eventType, handler });
}

export function removeEvent(element, eventType, handler) {
  if (!element || !eventType || !handler) return;

  eventHandlers.forEach((item) => {
    if (item.element === element && item.eventType === eventType && item.handler === handler) {
      eventHandlers.delete(item);
    }
  });
}
