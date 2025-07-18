// const eventMap = new WeakMap();

// export function setupEventListeners(root) {
//   if (root.__eventDelegationSetup) {
//     return;
//   }
//   root.__eventDelegationSetup = true;

//   root.addEventListener("click", (e) => {
//     let node = e.target;
//     while (node && node !== root) {
//       const handlers = eventMap.get(node);
//       if (handlers && handlers["click"]) {
//         handlers["click"].forEach((fn) => fn.call(node, e));
//       }
//       node = node.parentNode;
//     }
//   });
// }

// export function addEvent(element, eventType, handler) {
//   if (!eventMap.has(element)) eventMap.set(element, {});
//   const handlers = eventMap.get(element);
//   if (!handlers[eventType]) handlers[eventType] = new Set();
//   handlers[eventType].add(handler);
// }

// export function removeEvent(element, eventType, handler) {
//   const handlers = eventMap.get(element);
//   if (handlers && handlers[eventType]) {
//     handlers[eventType].delete(handler);
//   }
// }
const eventMap = new WeakMap();

const DELEGATED_EVENTS = ["click", "mouseover", "focus", "keydown", "change"];

export function setupEventListeners(root) {
  if (root.__eventDelegationSetup) return;
  root.__eventDelegationSetup = true;

  DELEGATED_EVENTS.forEach((eventType) => {
    root.addEventListener(eventType, (e) => {
      // stopPropagation이 호출되면 위임 핸들러도 멈춰야 함
      let node = e.target;
      while (node && node !== root && !e.cancelBubble) {
        const handlers = eventMap.get(node);
        if (handlers && handlers[eventType]) {
          handlers[eventType].forEach((fn) => fn.call(node, e));
        }
        node = node.parentNode;
      }
    }); // focus 등은 캡처 단계 필요
  });
}

export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) eventMap.set(element, {});
  const handlers = eventMap.get(element);
  if (!handlers[eventType]) handlers[eventType] = new Set();
  handlers[eventType].add(handler);
}

export function removeEvent(element, eventType, handler) {
  const handlers = eventMap.get(element);
  if (handlers && handlers[eventType]) {
    handlers[eventType].delete(handler);
  }
}
