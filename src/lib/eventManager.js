const eventRegistry = new WeakMap();
const DELEGATED_EVENTS = ["click", "mouseover", "focus", "keydown", "change"];

/**
 * 핸들러를 등록하되, 직접 DOM에 addEventListener를 하지 않음
 */
export function addEvent(element, eventType, handler) {
  if (!eventRegistry.has(element)) {
    eventRegistry.set(element, {});
  }

  const events = eventRegistry.get(element);
  if (!events[eventType]) {
    events[eventType] = new Set();
  }

  events[eventType].add(handler);
}

/**
 * 이벤트 위임용 리스너를 container에 등록
 */
export function setupEventListeners(root) {
  if (root.__eventDelegationSetup) return;
  root.__eventDelegationSetup = true;

  DELEGATED_EVENTS.forEach((eventType) => {
    root.addEventListener(
      eventType,
      (e) => {
        let target = e.target;
        while (target && target !== root) {
          const events = eventRegistry.get(target);
          if (events && events[eventType]) {
            for (const handler of events[eventType]) {
              handler.call(target, e);
            }
            if (e.cancelBubble) return;
          }
          target = target.parentNode;
        }
      },
      eventType === "focus" ? true : false, // focus는 캡처링 필요
    );
  });
}

/**
 * 핸들러 제거
 */
export function removeEvent(element, eventType, handler) {
  const events = eventRegistry.get(element);
  if (events?.[eventType]) {
    events[eventType].delete(handler);
    // Set이 비면 해당 이벤트 타입 자체를 삭제
    if (events[eventType].size === 0) {
      delete events[eventType];
    }
  }
}

/**
 * 해당 element의 모든 이벤트를 제거
 */
export function clearAllEvents(element) {
  const events = eventRegistry.get(element);
  if (!events) return;
  Object.keys(events).forEach((eventType) => {
    for (const handler of Array.from(events[eventType])) {
      removeEvent(element, eventType, handler);
    }
  });
}
