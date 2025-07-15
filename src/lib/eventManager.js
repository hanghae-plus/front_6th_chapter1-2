/**
 * 이벤트 위임 방식으로 구현
 * 부모 컨테이너에서 이벤트를 캐치하고 타겟을 확인해서
 * 해당 핸들러를 실행하는 방식으로 구현
 */

/**
 * 요소별 이벤트 핸들러 저장
 * elementEventsMap : Map(element, Map{ eventType: Set(handler) })
 * {
 *   element1: Map{
 *     eventType1: Set(handler1, handler2),
 *     eventType2: Set(handler3, handler4),
 *   },
 *   element2: {
 *     eventType1: Set(handler5, handler6),
 *   }
 * }
 */
export const elementEventsMap = new Map();

/**
 * 루트에 이벤트 위임 설정
 * 메모리에 저장된 모든 이벤트 타입들을 수집하고 한 번에 루트에 등록
 */
export function setupEventListeners(root) {
  // 등록된 모든 이벤트 타입들을 수집
  const allEventTypes = new Set();

  elementEventsMap.forEach((eventObject) => {
    Object.keys(eventObject).forEach((eventType) => {
      allEventTypes.add(eventType);
    });
  });

  // 각 이벤트 타입별로 한 번만 리스너 등록
  allEventTypes.forEach((eventType) => {
    // 이미 등록된 핸들러인지 확인
    const existingListener = root._eventListeners?.[eventType];
    if (existingListener) {
      return;
    }

    // 핸들러 등록
    const eventListener = (event) => {
      let target = event.target;

      while (target && target !== root) {
        // 이벤트가 발생한 요소의 이벤트 핸들러들
        const eventObject = elementEventsMap.get(target);

        if (eventObject && eventObject[eventType]) {
          eventObject[eventType].forEach((handler) => handler(event));
        }

        target = target.parentElement;
      }
    };

    // 핸들러 저장 및 등록
    if (!root._eventListeners) {
      root._eventListeners = {};
    }
    root._eventListeners[eventType] = eventListener;
    root.addEventListener(eventType, eventListener);
  });
}

/**
 * 이벤트 핸들러 메모리에 저장
 */
export function addEvent(element, eventType, handler) {
  console.log("addEvent");
  if (!elementEventsMap.has(element)) {
    elementEventsMap.set(element, {});
  }

  const eventsObject = elementEventsMap.get(element);

  if (!eventsObject[eventType]) {
    eventsObject[eventType] = new Set();
  }

  // Set은 자동으로 중복을 방지함
  eventsObject[eventType].add(handler);
  console.log("eventsObject: ", eventsObject);
  console.log("eventsObject[eventType]: ", eventsObject[eventType]);
}

/**
 * 이벤트 핸들러 메모리에서 제거
 */
export function removeEvent(element, eventType, handler) {
  const eventsObject = elementEventsMap.get(element);

  if (eventsObject && eventsObject[eventType]) {
    eventsObject[eventType].delete(handler);
  }
}
