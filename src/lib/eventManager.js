import { EVENT_TYPE_MAP } from "../constants.js";

const eventListeners = new Set();
let currentRoot = null;

export function setupEventListeners(root) {
  currentRoot = root;

  if (!root._delegatedEvents) {
    root._delegatedEvents = new Set();
  }

  eventListeners.forEach((listeners, eventType) => {
    // 이미 달았으면 건너뛴다.
    if (root._delegatedEvents.has(eventType)) {
      return;
    }

    root.addEventListener(eventType, handleEvent);
    root._delegatedEvents.add(eventType);
  });
}

export function addEvent(element, eventType, handler, vNode) {
  // 이벤트 타입을 Set에 추가한다. (위임을 위해)
  eventListeners.add(eventType);

  // vNode 초기화 - element._vNode가 undefined인 경우 먼저 초기화
  if (!element._vNode) {
    element._vNode = vNode || {};
  }

  // props 초기화 - element._vNode가 존재하는지 다시 확인
  if (element._vNode && !element._vNode.props) {
    element._vNode.props = {};
  }

  const eventPropName = getEventPropName(eventType);
  element._vNode.props[eventPropName] = handler;
}

// 이벤트 위임 핸들러
function handleEvent(event) {
  if (!event || !event.target || !currentRoot) {
    return;
  }

  let target = event.target;
  while (target && target !== currentRoot) {
    const vNode = target._vNode;
    if (vNode && vNode.props) {
      const key = getEventPropName(event.type);
      const handler = vNode.props[key];
      if (typeof handler === "function") {
        handler(createSyntheticEvent(event));
        break; // 이벤트 버블링 중단
      }
    }
    target = target.parentNode;
  }
}

// 매핑에 없는 이벤트에 대한 fallback 함수
function getEventPropName(eventType) {
  // 먼저 매핑에서 찾아보기
  if (EVENT_TYPE_MAP[eventType]) {
    return EVENT_TYPE_MAP[eventType];
  }

  // 매핑에 없으면 카멜케이스 변환
  return `on${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`;
}

function createSyntheticEvent(nativeEvent) {
  return {
    nativeEvent,
    target: nativeEvent.target,
    type: nativeEvent.type,
    // keyboard 이벤트 처리를 위해 key 값 추가
    key: nativeEvent.key,
    preventDefault() {
      nativeEvent.preventDefault();
    },
    stopPropagation() {
      nativeEvent.stopPropagation();
    },
  };
}

export function removeEvent(element, eventType, handler) {
  if (element._vNode && element._vNode.props) {
    const eventPropName = getEventPropName(eventType);

    // 핸들러가 동일한 경우에만 삭제
    if (element._vNode.props[eventPropName] === handler) {
      delete element._vNode.props[eventPropName];
    }
  }
}
