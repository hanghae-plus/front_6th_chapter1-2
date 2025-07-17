const eventList = [];

function findParent(element, target) {
  if (element == null) {
    return null;
  }

  if (element === target) {
    return element;
  }

  return findParent(element.parentElement, target);
}

export function setupEventListeners(root) {
  const allDomEvents = [
    // 마우스 이벤트
    "click",
    "dblclick",
    "mousedown",
    "mouseup",
    "mousemove",
    "mouseenter",
    "mouseleave",
    "mouseover",
    "mouseout",
    "contextmenu",
    "auxclick",

    // 키보드 이벤트
    "keydown",
    "keypress",
    "keyup",

    // 입력/폼 이벤트
    "input",
    "change",
    "submit",
    "reset",
    "focus",
    "blur",
    "focusin",
    "focusout",
    "invalid",

    // 터치 이벤트
    "touchstart",
    "touchmove",
    "touchend",
    "touchcancel",

    // 포인터 이벤트
    "pointerdown",
    "pointerup",
    "pointermove",
    "pointercancel",
    "pointerover",
    "pointerout",
    "pointerenter",
    "pointerleave",
    "gotpointercapture",
    "lostpointercapture",

    // 휠 및 스크롤 이벤트
    "wheel",
    "scroll",

    // 드래그 & 드롭 이벤트
    "drag",
    "dragstart",
    "dragend",
    "dragenter",
    "dragleave",
    "dragover",
    "drop",

    // 클립보드 이벤트
    "copy",
    "cut",
    "paste",

    // 컴포지션 이벤트
    "compositionstart",
    "compositionupdate",
    "compositionend",

    // 윈도우 이벤트
    "load",
    "beforeunload",
    "unload",
    "resize",
    "hashchange",
    "popstate",
    "DOMContentLoaded",
    "visibilitychange",
    "storage",

    // 네트워크 이벤트
    "online",
    "offline",

    // 미디어 이벤트
    "play",
    "pause",
    "playing",
    "waiting",
    "ended",
    "volumechange",
    "timeupdate",
    "seeking",
    "seeked",
    "loadeddata",
    "loadedmetadata",
    "canplay",
    "canplaythrough",

    // 애니메이션/트랜지션 이벤트
    "animationstart",
    "animationend",
    "animationiteration",
    "transitionstart",
    "transitionend",
    "transitionrun",
    "transitioncancel",

    // 오류 및 기타
    "error",
    "abort",
    "close",
    "open",
  ];

  for (const eventType of allDomEvents) {
    root.addEventListener(eventType, (e) => {
      const events = eventList.filter((event) => event.eventType === eventType);
      if (events.length <= 0) {
        return;
      }

      for (const event of events) {
        if (event.element === findParent(e.target, event.element)) {
          event.handler(e);
          break;
        }
      }
    });
  }
}

export function addEvent(element, eventType, handler) {
  eventList.push({ element, eventType, handler });
}

export function removeEvent(element, eventType, handler) {
  const index = eventList.findIndex(
    (event) => event.element === element && event.eventType === eventType && event.handler === handler,
  );

  if (index !== -1) {
    eventList.splice(index, 1);
  }
}
