/**
 * 동작 원리
 * addEvent: 트리에 등록되어있는 이벤트들을 WeakMap 기반으로 수집
 * removeEvent: updateElement에서 호출됨. 이벤트 핸들러가 제거되어야 할때 호출
 * attachEvent: setupEventListeners에서 호출됨. 타입별 (버블링이 일어나는)이벤트를 루트에 부착
 * setupEventListeners: 루트 엘리먼트가 변경될 때 호출되어
 */

type EventHandler = (event: Event) => void;

/**
 * MEMO: 왜 이런 파악하기 어려운 중첩된 구조를 짜게 되었는지
 * elementHandlerMap: 각각의 엘리먼트는 여러개의 이벤트를 가질 수 있고 또 각각의 이벤트 타입을 가진 핸들러는 여러개임
 * elementHandlerMap에 이번에 등록할 이벤트의 타입이 없다면 추가를,
 * eventType에 이번에 등록할 핸들러가 없다면 추가를 해줌
 */
// `elementHandlerMap` – 특정 요소가 가지고 있는 이벤트 {target, {eventType, handler}} 저장
const elementHandlerMap = new WeakMap<EventTarget, Map<string, Set<EventHandler>>>();
// 전역에서 위임된 모든 이벤트 타입을 중복없이 저장
const globalEventTypes = new Set<string>();

let rootElement: HTMLElement | null = null;
// 루트에 등록된 리스너들 - {eventType: listener}
const rootListenerMap = new Map<string, EventListener>();

export function addEvent(element: HTMLElement, eventType: string, handler: EventHandler): void {
  globalEventTypes.add(eventType);
  // 전역에 현재 이벤트 타입을 기록(Set 사용으로 중복 자동 제거)
  let typeMap = elementHandlerMap.get(element);
  if (!typeMap) {
    typeMap = new Map();
    elementHandlerMap.set(element, typeMap);
  }
  // 이벤트 타입에 대한 핸들러 추가
  let handlers = typeMap.get(eventType);
  if (!handlers) {
    handlers = new Set();
    typeMap.set(eventType, handlers);
  }
  handlers.add(handler);

  // 루트가 이미 설정돼 있다면 즉시 위임 리스너를 설치
  if (rootElement) attachEvent(eventType);
}

export function removeEvent(element: HTMLElement, eventType: string, handler: EventHandler): void {
  const typeMap = elementHandlerMap.get(element);
  if (!typeMap) return;

  const handlers = typeMap.get(eventType);
  if (!handlers) return;

  handlers.delete(handler);

  // 필요없는 상위 자료구조들을 탐색해가며 제거
  if (handlers.size === 0) typeMap.delete(eventType);
  if (typeMap.size === 0) elementHandlerMap.delete(element);
}

export function setupEventListeners(root: HTMLElement): void {
  const isRerender = rootElement && rootElement !== root;
  if (isRerender) {
    rootListenerMap.forEach((listener, type) => {
      rootElement!.removeEventListener(type, listener);
    });
    rootListenerMap.clear();
  }

  rootElement = root;

  // 현재까지 등록된 모든 이벤트 타입을 새 루트에 바인딩
  globalEventTypes.forEach((type) => attachEvent(type));
}

function attachEvent(eventType: string): void {
  if (!rootElement) return;
  if (rootListenerMap.has(eventType)) return;

  const listener = (event: Event): void => {
    let current = event.target as HTMLElement | null;
    // 타겟에서 직계 조상 라인을 타고 루트까지 가지고있는 이벤트를 모두 실행(버블링)시킴
    while (current) {
      const typeMap = elementHandlerMap.get(current);
      const handlers = typeMap?.get(event.type);
      if (handlers && handlers.size) {
        // 해당 요소가 가진 해당 이벤트 타입의 모든 핸들러 실행
        handlers.forEach((handler) => handler.call(current, event));
      }
      // 루트까지 이동
      if (current === rootElement) break;
      current = current.parentElement;
    }
  };

  rootElement.addEventListener(eventType, listener);
  rootListenerMap.set(eventType, listener);
}
