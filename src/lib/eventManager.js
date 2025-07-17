/**
 * 먼저 적어보기
 *
 * 루트에 할당해야 하는 이벤트
 * addEvent:
 * - 이벤트 최초 등록시 root에 리스너 할당
 * - 이벤트타입-엘리먼트 를 키로 핸들러 저장
 * - setup 을 전/후 구분이 필요할듯??
 *
 * 요소에 할당해야 하는 이벤트
 * addEvent:
 * - 이벤트 최초 등록시 요소에 리스너 할당
 * - 이벤트타입-엘리먼트 를 키로 핸들러 저장
 * - 요소가 제거된 후엔 핸들러를 GC 하도록..
 *
 * removeEvent:
 * - 이벤트 제거시 요소에 리스너 제거
 * - 이벤트타입-엘리먼트 를 키로 핸들러 제거
 * - setup 을 전/후 구분이 필요할듯??
 *
 */

const notBubblingEvents = new Set(
  // 버블링이 발생하지 않는 이벤트 필요하다면 추가
  ["focus", "blur"],
);

// const notBubblingEventsMap = new Map(
//   // 버블링이 발생하지 않는 이벤트 필요하다면 추가
//   ["focus", "focusin"],
//   ["blur", "focusout"],
// );
let eventsRecord = {};
let $root = null;

export function setupEventListeners(root) {
  $root = root;

  for (const eventType in eventsRecord) {
    if (!notBubblingEvents.has(eventType)) {
      addEventListener(eventType);
    }
  }
}

export function addEvent(element, eventType, handler) {
  if (notBubblingEvents.has(eventType)) {
    eventsRecord[eventType] = new Map();
    eventsRecord[eventType].set(element, handler);
    addNotBubblingEventListener(eventType, element, handler);
  } else {
    if (!(eventType in eventsRecord)) {
      eventsRecord[eventType] = new Map();
      addEventListener(eventType);
    }

    eventsRecord[eventType].set(element, handler);
  }
}

export function removeEvent(element, eventType, handler) {
  if (notBubblingEvents.has(eventType)) {
    element.removeEventListener(eventType, handler);
  }

  eventsRecord[eventType].delete(element);
  if (!eventsRecord[eventType].size) {
    eventsRecord[eventType] = null;
  }
}

function addNotBubblingEventListener(eventType, element, handler) {
  if (notBubblingEvents.has(eventType)) {
    // 버블링 이벤트가 아닌 경우, 요소에 이벤트 핸들러를 등록한다.
    element.removeEventListener(eventType, handler);
    element.addEventListener(eventType, handler);
    return;
  }
}

function addEventListener(eventType) {
  if (!$root) {
    // 이벤트 위임을 위해 루트가 필요하다.
    return;
  }

  $root.addEventListener(eventType, (e) => {
    let isStopped = false;
    Object.defineProperty(e, "stopPropagation", {
      value: () => {
        isStopped = true;
      },
    });

    const deepestElements = getDeepestContainingElements(e.target, eventsRecord[eventType]);
    for (const [, handler] of deepestElements) {
      if (isStopped) {
        break;
      }

      handler(e);
    }
  });
}

function getDeepestContainingElements(target, eventsMap) {
  return Array.from(eventsMap)
    .filter(([element]) => element.contains(target))
    .sort((a, b) => {
      const aElement = a[0];
      const bElement = b[0];

      if (aElement.contains(bElement)) {
        return 1;
      }

      if (bElement.contains(aElement)) {
        return -1;
      }

      return 0;
    });
}
