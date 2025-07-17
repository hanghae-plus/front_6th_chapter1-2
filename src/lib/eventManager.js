const handlers = new Map();

const eventTypes = new Set();

const setupRoots = new WeakSet();

export function setupEventListeners(root) {
  if (setupRoots.has(root)) return;

  eventTypes.forEach((eventType) => {
    root.addEventListener(eventType, handleEvent);
  });

  setupRoots.add(root);
}

function handleEvent(event) {
  let target = event.target;
  while (target) {
    const elementHandlers = handlers.get(target);
    if (elementHandlers && elementHandlers[event.type]) {
      elementHandlers[event.type].forEach((handler) => handler(event));
      break;
    }
    target = target.parentElement;
  }
}

export function addEvent(element, eventType, handler) {
  if (!handlers.has(element)) {
    handlers.set(element, {});
  }

  const elementHandlers = handlers.get(element);
  if (!elementHandlers[eventType]) {
    elementHandlers[eventType] = [];
  }

  // 중복 등록 방지
  if (!elementHandlers[eventType].includes(handler)) {
    elementHandlers[eventType].push(handler);
  }

  if (!eventTypes.has(eventType)) {
    eventTypes.add(eventType);

    const root = findRoot(element);
    if (root && setupRoots.has(root)) {
      root.addEventListener(eventType, handleEvent);
    }
  }
}

function findRoot(element) {
  let current = element;
  while (current.parentElement) {
    current = current.parentElement;
  }
  return current;
}

export function removeEvent(element, eventType, handler) {
  const elementHandlers = handlers.get(element);

  if (elementHandlers && elementHandlers[eventType]) {
    const index = elementHandlers[eventType].indexOf(handler);
    if (index > -1) {
      elementHandlers[eventType].splice(index, 1);
    }
  }
}
