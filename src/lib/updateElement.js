import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

/**
 * DOM Element의 속성을 비교하여 업데이트하는 함수
 * @param target - 업데이트할 DOM Element
 * @param newProps - 새로운 속성들
 * @param oldProps - 이전 속성들
 */
export function updateAttributes(element, newProps, oldProps = null) {
  if (!newProps && !oldProps) return;

  if (oldProps) {
    Object.keys(oldProps).forEach((key) => {
      if (key === "children") return;

      if (key.startsWith("on")) {
        const eventType = key.substring(2).toLowerCase();
        removeEvent(element, eventType, oldProps[key]);
      } else if (!newProps || !(key in newProps)) {
        element.removeAttribute(key);
      }
    });
  }

  if (newProps) {
    Object.entries(newProps).forEach(([key, value]) => {
      if (key === "children") return;

      if (key === "className") {
        if (value) element.setAttribute("class", value);
        return;
      }

      if (key.startsWith("on")) {
        const eventType = key.substring(2).toLowerCase();
        addEvent(element, eventType, value);
        return;
      }

      if (value != null && (!oldProps || oldProps[key] !== value)) {
        element.setAttribute(key, String(value));
      }
    });
  }
}
