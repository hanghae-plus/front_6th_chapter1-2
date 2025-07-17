// 이벤트 매니저 설정 상수
const CONFIG = {
  ROOT_EVENT_LISTENERS_KEY: "_eventListeners",
  UNKNOWN_ELEMENT_TAG: "unknown",
};

// 이벤트 타입 상수
const EVENT_TYPES = {
  CLICK: "click",
  SUBMIT: "submit",
  CHANGE: "change",
  INPUT: "input",
  FOCUS: "focus",
  BLUR: "blur",
  KEYDOWN: "keydown",
  KEYUP: "keyup",
  MOUSEENTER: "mouseenter",
  MOUSELEAVE: "mouseleave",
};

/**
 * 이벤트 매니저 클래스
 * DOM 이벤트를 효율적으로 관리하고 위임 패턴을 구현합니다.
 */
class EventManager {
  constructor() {
    // 이벤트 핸들러 저장소 (element → Map(eventType → Set(handler)))
    this.eventStore = new Map();
    // 현재 root 요소
    this.currentRoot = null;
    // 활성화된 이벤트 리스너 추적
    this.activeListeners = new Map();
  }

  /**
   * 이벤트 핸들러를 요소에 추가합니다.
   * @param {Element} element - 이벤트를 추가할 DOM 요소
   * @param {string} eventType - 이벤트 타입
   * @param {Function} handler - 이벤트 핸들러 함수
   */
  addEvent(element, eventType, handler) {
    if (!this.isValidElement(element)) {
      console.warn("유효하지 않은 요소에 이벤트를 추가하려고 시도했습니다:", element);
      return;
    }

    if (typeof handler !== "function") {
      console.warn("핸들러는 함수여야 합니다:", handler);
      return;
    }

    try {
      this.ensureElementEventMap(element);
      const typeMap = this.eventStore.get(element);
      this.ensureEventTypeSet(typeMap, eventType);

      const handlerSet = typeMap.get(eventType);
      handlerSet.add(handler);

      this.updateEventDelegation();
    } catch (error) {
      console.error("이벤트 추가 중 오류 발생:", error);
    }
  }

  /**
   * 이벤트 핸들러를 요소에서 제거합니다.
   * @param {Element} element - 이벤트를 제거할 DOM 요소
   * @param {string} eventType - 이벤트 타입
   * @param {Function} handler - 제거할 이벤트 핸들러 함수
   */
  removeEvent(element, eventType, handler) {
    if (!this.isValidElement(element)) {
      return;
    }

    try {
      if (this.eventStore.has(element)) {
        const typeMap = this.eventStore.get(element);
        if (typeMap.has(eventType)) {
          const handlerSet = typeMap.get(eventType);
          handlerSet.delete(handler);

          // 핸들러가 없으면 이벤트 타입 제거
          if (handlerSet.size === 0) {
            typeMap.delete(eventType);
          }
        }

        // 이벤트 타입이 없으면 요소 제거
        if (typeMap.size === 0) {
          this.eventStore.delete(element);
        }
      }

      this.updateEventDelegation();
    } catch (error) {
      console.error("이벤트 제거 중 오류 발생:", error);
    }
  }

  /**
   * 요소의 모든 이벤트를 제거합니다.
   * @param {Element} element - 이벤트를 제거할 DOM 요소
   */
  removeAllEvents(element) {
    if (!this.isValidElement(element)) {
      return;
    }

    try {
      this.eventStore.delete(element);
      this.updateEventDelegation();
    } catch (error) {
      console.error("모든 이벤트 제거 중 오류 발생:", error);
    }
  }

  /**
   * root 요소에 이벤트 위임을 설정합니다.
   * @param {Element} root - 이벤트 위임을 설정할 root 요소
   */
  setupEventListeners(root) {
    if (!this.isValidElement(root)) {
      console.warn("유효하지 않은 root 요소입니다:", root);
      return;
    }

    try {
      this.currentRoot = root;
      this.cleanupExistingListeners(root);
      this.registerNewListeners(root);
    } catch (error) {
      console.error("이벤트 리스너 설정 중 오류 발생:", error);
    }
  }

  /**
   * 모든 이벤트 리스너를 정리합니다.
   */
  cleanup() {
    if (this.currentRoot) {
      this.cleanupExistingListeners(this.currentRoot);
    }
    this.eventStore.clear();
    this.activeListeners.clear();
    this.currentRoot = null;
  }

  /**
   * 저장된 이벤트 정보를 반환합니다.
   * @returns {Object} 이벤트 정보 객체
   */
  getEventInfo() {
    const info = {};

    this.eventStore.forEach((typeMap, element) => {
      const elementInfo = {};
      typeMap.forEach((handlerSet, eventType) => {
        elementInfo[eventType] = handlerSet.size;
      });
      const elementKey = element.tagName || CONFIG.UNKNOWN_ELEMENT_TAG;
      info[elementKey] = elementInfo;
    });

    return info;
  }

  /**
   * 요소가 유효한지 확인합니다.
   * @param {Element} element - 확인할 요소
   * @returns {boolean} 유효성 여부
   */
  isValidElement(element) {
    return element && element instanceof Element;
  }

  /**
   * 요소의 이벤트 맵을 보장합니다.
   * @param {Element} element - 대상 요소
   */
  ensureElementEventMap(element) {
    if (!this.eventStore.has(element)) {
      this.eventStore.set(element, new Map());
    }
  }

  /**
   * 이벤트 타입의 핸들러 세트를 보장합니다.
   * @param {Map} typeMap - 이벤트 타입 맵
   * @param {string} eventType - 이벤트 타입
   */
  ensureEventTypeSet(typeMap, eventType) {
    if (!typeMap.has(eventType)) {
      typeMap.set(eventType, new Set());
    }
  }

  /**
   * 기존 이벤트 리스너를 정리합니다.
   * @param {Element} root - root 요소
   */
  cleanupExistingListeners(root) {
    const existingListeners = root[CONFIG.ROOT_EVENT_LISTENERS_KEY] || new Map();
    existingListeners.forEach((handler, eventType) => {
      root.removeEventListener(eventType, handler);
    });
  }

  /**
   * 새로운 이벤트 리스너를 등록합니다.
   * @param {Element} root - root 요소
   */
  registerNewListeners(root) {
    const newListeners = new Map();
    const allEventTypes = this.collectAllEventTypes();

    allEventTypes.forEach((eventType) => {
      const delegatedHandler = this.createDelegatedHandler(eventType);
      root.addEventListener(eventType, delegatedHandler);
      newListeners.set(eventType, delegatedHandler);
    });

    root[CONFIG.ROOT_EVENT_LISTENERS_KEY] = newListeners;
  }

  /**
   * 모든 이벤트 타입을 수집합니다.
   * @returns {Set} 이벤트 타입 세트
   */
  collectAllEventTypes() {
    const allEventTypes = new Set();
    this.eventStore.forEach((typeMap) => {
      typeMap.forEach((handlerSet, eventType) => {
        allEventTypes.add(eventType);
      });
    });
    return allEventTypes;
  }

  /**
   * 위임된 이벤트 핸들러를 생성합니다.
   * @param {string} eventType - 이벤트 타입
   * @returns {Function} 위임된 핸들러 함수
   */
  createDelegatedHandler(eventType) {
    return (event) => {
      let currentElement = event.target;

      while (currentElement && currentElement !== this.currentRoot) {
        if (this.eventStore.has(currentElement)) {
          const typeMap = this.eventStore.get(currentElement);
          if (typeMap.has(eventType)) {
            const handlerSet = typeMap.get(eventType);
            handlerSet.forEach((handler) => {
              try {
                handler(event);
              } catch (error) {
                console.error("이벤트 핸들러 실행 중 오류:", error);
              }
            });
          }
        }
        currentElement = currentElement.parentElement;
      }
    };
  }

  /**
   * 이벤트 위임을 업데이트합니다.
   */
  updateEventDelegation() {
    if (this.currentRoot) {
      this.setupEventListeners(this.currentRoot);
    }
  }
}

// 싱글톤 인스턴스 생성
const eventManager = new EventManager();

// 공개 API
export const addEvent = (element, eventType, handler) => eventManager.addEvent(element, eventType, handler);

export const removeEvent = (element, eventType, handler) => eventManager.removeEvent(element, eventType, handler);

export const removeAllEvents = (element) => eventManager.removeAllEvents(element);

export const setupEventListeners = (root) => eventManager.setupEventListeners(root);

export const cleanup = () => eventManager.cleanup();

export const getEventInfo = () => eventManager.getEventInfo();

// 상수들도 export
export { CONFIG, EVENT_TYPES };
