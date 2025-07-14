/**
 * 이벤트 위임 방식으로 구현
 * 부모 컨테이너에서 이벤트를 캐치하고 타겟을 확인해서
 * 해당 핸들러를 실행하는 방식으로 구현
 */

/**
 * 요소별 이벤트 핸들러 저장
 * elementEventsMap[element] = { eventType: handler }
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
    root.addEventListener(eventType, (event) => {
      let target = event.target; // 이벤트가 실제로 발생한 타겟

      while (target && target !== root) {
        // 이벤트가 발생한 요소의 이벤트 핸들러들
        const eventObject = elementEventsMap.get(target);

        if (eventObject && eventObject[eventType]) {
          eventObject[eventType].forEach((handler) => handler(event));
        }

        // 상위 요소로 이동하면서 핸들러 실행 (이벤트 버블링 구현)
        // ? 이걸 안 해주면 왜 버블링이 발생하지 않나?
        target = target.parentElement;
      }
    });
  });
}

/**
 * 이벤트 핸들러 메모리에 저장
 */
export function addEvent(element, eventType, handler) {
  if (!elementEventsMap.has(element)) {
    elementEventsMap.set(element, {});
  }

  const eventsObject = elementEventsMap.get(element);
  if (!eventsObject[eventType]) {
    eventsObject[eventType] = [];
  }

  eventsObject[eventType].push(handler);
}

/**
 * 이벤트 핸들러 메모리에서 제거
 */
export function removeEvent(element, eventType, handler) {
  const eventsObject = elementEventsMap.get(element);

  if (eventsObject && eventsObject[eventType]) {
    const index = eventsObject[eventType].indexOf(handler);

    if (index > -1) {
      eventsObject[eventType].splice(index, 1);
    }
  }
}
