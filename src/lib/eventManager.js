/**
 * 이벤트 위임 방식으로 구현
 * 부모 컨테이너에서 이벤트를 캐치하고 타겟을 확인해서
 * 해당 핸들러를 실행하는 방식으로 구현
 */

/**
 * 이벤트 맵
 * Map{
 *   element1: Map{
 *     eventType1: Set(handler1, handler2),
 *     eventType2: Set(handler3, handler4),
 *   },
 *   element2: {
 *     eventType1: Set(handler5, handler6),
 *   }
 * }
 */
const eventMap = new WeakMap();
const delegatedEventTypes = new Set();
let root = null;

/**
 * 루트에 이벤트 위임 설정
 * 메모리에 저장된 모든 이벤트 타입들을 수집하고 한 번에 루트에 등록
 */
export function setupEventListeners(container) {
  root = container;

  delegatedEventTypes.forEach((eventType) => {
    container.removeEventListener(eventType, handleDelegatedEvent);
    container.addEventListener(eventType, handleDelegatedEvent);
  });
}

const handleDelegatedEvent = (event) => {
  let target = event.target;

  while (target && target !== root) {
    const eventsOfElement = eventMap.get(target);

    // ! eventType이 아닌 event.type으로 비교하는 이유는
    // 이벤트 위임 방식으로 구현하면 이벤트 타입이 무엇인지 알 수 없기 때문에
    // event.type으로 비교하는 것이 올바른 방법이다.
    if (eventsOfElement && eventsOfElement.has(event.type)) {
      eventsOfElement.get(event.type).forEach((handler) => handler(event));
      return;
    }

    target = target.parentElement;
  }
};

/**
 * 이벤트 핸들러 메모리에 저장
 */
export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) {
    eventMap.set(element, new Map());
  }

  const eventsOfElements = eventMap.get(element);

  if (!eventsOfElements.has(eventType)) {
    eventsOfElements.set(eventType, new Set());
  }

  eventsOfElements.get(eventType).add(handler);

  if (!delegatedEventTypes.has(eventType)) {
    delegatedEventTypes.add(eventType);

    if (root) {
      root.removeEventListener(eventType, handleDelegatedEvent);
      root.addEventListener(eventType, handleDelegatedEvent);
    }
  }
}

/**
 * 이벤트 핸들러 메모리에서 제거
 */
export function removeEvent(element, eventType, handler) {
  const eventsOfElements = eventMap.get(element);
  if (!eventsOfElements) return;

  if (eventsOfElements.get(eventType)) {
    eventsOfElements.get(eventType).delete(handler);
  }
}
