import { EventHandler } from "../core/types.ts";

const eventMap = new Map<string, WeakMap<Element, Set<EventHandler>>>();
let rootElement: Element | null = null;

export function setupEventListeners(root: Element): void {
  rootElement = root;
  eventMap.forEach((handlers, eventType) => {
    rootElement!.removeEventListener(eventType, handleEvent);
    rootElement!.addEventListener(eventType, handleEvent);
  });
}

function handleEvent(event: Event): void {
  let target = event.target as Element | null;
  while (target && target !== rootElement) {
    const elementHandlers = eventMap.get(event.type)?.get(target);
    if (elementHandlers) {
      elementHandlers.forEach((handler) => handler(event));
    }
    target = target.parentNode as Element | null;
  }
}

export function addEvent(element: Element, eventType: string, handler: EventHandler): void {
  if (!eventMap.has(eventType)) {
    eventMap.set(eventType, new WeakMap<Element, Set<EventHandler>>());
  }
  const elementMap = eventMap.get(eventType)!;
  if (!elementMap.has(element)) {
    elementMap.set(element, new Set<EventHandler>());
  }
  elementMap.get(element)!.add(handler);
}

export function removeEvent(element: Element, eventType: string, handler: EventHandler): void {
  const elementMap = eventMap.get(eventType);
  if (!elementMap) return;

  const handlers = elementMap.get(element);
  if (!handlers) {
    return;
  }
  handlers.delete(handler);
  if (handlers.size === 0) {
    elementMap.delete(element);
  }
}
