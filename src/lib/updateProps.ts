/**
 * 동작원리
 * createElement와 updateElement 모듈이 updateProps 모듈을 공용으로 사용함.
 *
 * 크게 2가지 케이스의 처리 방식의 분기 존재
 * 1. 속성제거: prevProps에만 존재하는 속성이 있다면 제거
 * 2. 속성추가 / 갱신: prevProps에 없는 속성이 있다면 추가, 이미 존재하는 속성은 필요에 따라 갱신
 *
 * 속성 유형은 크게 4가지 존재
 * 1. 이벤트 핸들러
 * 2. className / class
 * 3. boolean 속성
 * 4. 그 외 일반 속성
 *
 * 처리 방식에 따라 유형별로 속성을 업데이트함
 */

import type { VElementProps } from "../types";
import { addEvent, removeEvent } from "./eventManager";

const isEventAttr = (key: string): boolean => /^on[A-Z]/.test(key);

export function updateProps(
  element: HTMLElement,
  prevProps: VElementProps | null | undefined,
  currentProps: VElementProps | null | undefined,
): void {
  prevProps = prevProps || {};
  currentProps = currentProps || {};

  // prevProps에만 존재하는 속성 제거
  for (const key in prevProps) {
    if (!(key in currentProps)) {
      const prevVal = prevProps[key];

      if (isEventAttr(key) && typeof prevVal === "function") {
        const eventType = key.slice(2).toLowerCase();
        removeEvent(element, eventType, prevVal);
        continue;
      }

      if (key === "className" || key === "class") {
        element.className = "";
        element.removeAttribute("class");
        continue;
      }

      if (typeof prevVal === "boolean") {
        (element as any)[key] = false;
        if (key !== "checked" && key !== "selected") {
          element.removeAttribute(key);
        }
        continue;
      }

      element.removeAttribute(key);
    }
  }

  // 속성 추가 또는 갱신
  for (const key in currentProps) {
    const prevVal = prevProps[key];
    const nextVal = currentProps[key];

    if (prevVal === nextVal) continue;

    if (isEventAttr(key) && typeof nextVal === "function") {
      const eventType = key.slice(2).toLowerCase();
      if (typeof prevVal === "function") removeEvent(element, eventType, prevVal);
      addEvent(element, eventType, nextVal);
      continue;
    }

    if (key === "className" || key === "class") {
      if (nextVal === "") {
        element.className = "";
        element.removeAttribute("class");
      } else {
        element.className = String(nextVal);
      }
      continue;
    }

    if (typeof nextVal === "boolean") {
      (element as any)[key] = nextVal;
      if (key !== "checked" && key !== "selected") {
        if (nextVal) element.setAttribute(key, "");
        else element.removeAttribute(key);
      }
      continue;
    }

    if (nextVal == null) {
      element.removeAttribute(key);
      continue;
    }

    // 그 외 일반 속성
    element.setAttribute(key, String(nextVal));
  }
}
