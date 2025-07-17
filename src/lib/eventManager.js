// 이벤트 위임을 위한 이벤트 저장소
const eventStore = new Map();
const registeredRoots = new Set();

// 개선할 수 있는 키워드 : WeakMap (메모리 최적화), 이벤트 버블링 & 이벤트 위임 (자바스크립트 이벤트 처리 방식)

export function setupEventListeners(root) {
  const eventTypes = ["click", "mouseover", "focus", "keydown", "change"];

  // 이미 등록된 root라면 기존 이벤트 리스너 제거
  if (registeredRoots.has(root)) {
    eventTypes.forEach((eventType) => {
      root.removeEventListener(eventType, root[`_${eventType}Handler`]);
    });
  }

  eventTypes.forEach((eventType) => {
    const handler = (e) => {
      let target = e.target;

      // 변경본 : 기존에 실행하던 root[`_${eventType}Handler`]는 "클릭" 된 타겟의 이벤트만 실행하기 때문에
      // 현재는 root 에 이벤트가 있으므로 부모 요소를 타고 올라가면서 해당하는 이벤트를 찾아서 실행하는 방식으로 변경
      while (target && target !== e.currentTarget.parentElement) {
        const handlers = eventStore.get(target)?.[eventType] || [];

        handlers.forEach((handler) => {
          handler(e);
        });

        target = target.parentElement;
      }
    };

    // 핸들러를 root 객체에 저장하여 나중에 제거할 수 있도록 함
    root[`_${eventType}Handler`] = handler;
    root.addEventListener(eventType, handler);
  });

  registeredRoots.add(root);
}

export function addEvent(element, eventType, handler) {
  if (!eventStore.has(element)) {
    eventStore.set(element, {});
  }

  if (!eventStore.get(element)[eventType]) {
    eventStore.get(element)[eventType] = [];
  }

  eventStore.get(element)[eventType].push(handler);
}

export function removeEvent(element, eventType, handler) {
  const elementEvents = eventStore.get(element);
  if (!elementEvents || !elementEvents[eventType]) return;

  const handlers = elementEvents[eventType];
  const index = handlers.indexOf(handler);

  if (index > -1) {
    handlers.splice(index, 1);
  }
}
