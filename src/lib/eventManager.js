// 전역 저장소들
const eventStore = new WeakMap();
const registeredRoots = new WeakSet();

export function setupEventListeners(root) {
  // 이미 등록된 루트면 종료
  if (registeredRoots.has(root)) return;
  registeredRoots.add(root);

  const eventTypes = [
    'click',
    'input', 
    'change',
    'keydown',
    'keyup',
    'submit',
    'mouseover',
    'mouseout',
    'mousedown',
    'mouseup', 
    'focus',
    'blur'
  ];
  
  eventTypes.forEach(eventType => {
    // 이벤트 위임 리스너 등록
    root.addEventListener(eventType, (e) => {
      let currentElement = e.target;
      
      // 타겟에서 루트까지 거슬러 올라가며 핸들러 찾기
      while (currentElement && currentElement !== root.parentNode) {
        const elementEvents = eventStore.get(currentElement);
        
        if (elementEvents) {
          const handlers = elementEvents.get(eventType);
          
          if (handlers && handlers.size > 0) {
            // 등록된 모든 핸들러 실행
            handlers.forEach(handler => handler(e));
            return; // 핸들러 발견시 즉시 중단
          }
        }
        
        currentElement = currentElement.parentNode;
      }
    }, false); // 버블링 단계에서 처리
  });
}

export function addEvent(element, eventType, handler) {
  // 요소별 이벤트 맵 초기화
  if (!eventStore.has(element)) {
    eventStore.set(element, new Map());
  }
  
  const elementEvents = eventStore.get(element);
  
  // 이벤트 타입별 핸들러 Set 초기화
  if (!elementEvents.has(eventType)) {
    elementEvents.set(eventType, new Set());
  }
  
  // 핸들러 추가 (Set이 자동으로 중복 방지)
  elementEvents.get(eventType).add(handler);
}

export function removeEvent(element, eventType, handler) {
  const elementEvents = eventStore.get(element);
  if (!elementEvents) return;
  
  const handlers = elementEvents.get(eventType);
  if (!handlers) return;
  
  // 핸들러 제거
  handlers.delete(handler);
  
  // 메모리 정리: 빈 구조 제거
  if (handlers.size === 0) {
    elementEvents.delete(eventType);
    if (elementEvents.size === 0) {
      eventStore.delete(element);
    }
  }
}