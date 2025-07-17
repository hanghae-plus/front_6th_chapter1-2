// ?

// 이벤트가 위임 방식으로 등록되어야 한다
// let container
//  const button = document.createElement("button");
//  container.appendChild(button);

// <button></button>

// const mockFn = vi.fn();는 가짜 함수 ?
// vi.fn()을 사용하면 텅 빈 mocking 함수

// 처음생각
// root에 이벤트를 등록하는것이니
// root안에 childNode를 돌리면서
// 이벤트함수가 있으면 그걸 addEventListner한다? 였다ㅏㅏ

// 이벤트배열 만들어서 addEvent할때마다 push?

const eventMap = new Map(); // eventType => Set of { targetEl, handler }
const setupContainers = new WeakSet();

export function setupEventListeners(root) {
  if (setupContainers.has(root)) return;

  for (const [eventType, listeners] of eventMap.entries()) {
    root.addEventListener(eventType, (e) => {
      for (const { targetEl, handler } of listeners) {
        if (targetEl.contains(e.target)) {
          handler(e);
        }
      }
    });
  }

  setupContainers.add(root);
}

export function addEvent(element, eventType, handler) {
  if (!eventMap.has(eventType)) {
    eventMap.set(eventType, new Set());
  }

  eventMap.get(eventType).add({ targetEl: element, handler });
}

export function removeEvent(element, eventType, handler) {
  const listeners = eventMap.get(eventType);
  if (!listeners) return;

  for (const listener of listeners) {
    if (listener.targetEl === element && listener.handler === handler) {
      listeners.delete(listener);
      break;
    }
  }

  if (listeners.size === 0) {
    eventMap.delete(eventType);
  }
}
