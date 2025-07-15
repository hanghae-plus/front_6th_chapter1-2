import type { VElementProps } from "../../types";
import { addEvent, removeEvent } from "../eventManager";

// 이벤트 핸들러 프로퍼티 식별용 정규식 (onClick, onMouseOver 등)

const isEvent = (key: string) => /^on[A-Z]/.test(key);

export function updateProps(element: HTMLElement, prevProps: VElementProps, currentProps: VElementProps): void {
  prevProps = prevProps || {};
  currentProps = currentProps || {};

  // prevProps에만 존재하는 속성 제거
  for (const key in prevProps) {
    if (!(key in currentProps)) {
      if (isEvent(key) && typeof prevProps[key] === "function") {
        const eventType = key.slice(2).toLowerCase();
        removeEvent(element, eventType, prevProps[key]);
        continue;
      }

      if (key === "className" || key === "class") {
        element.className = "";
        element.removeAttribute("class");
        continue;
      }

      if (typeof prevProps[key] === "boolean") {
        // MEMO: any를 사용한 실용적인 이유: HTMLElement에 어떤 속성이 들어올지는 현재 단계에서 추측할 수 없으며 복잡한 타이핑을 하기보다는 과제 본질에 집중하기 위함
        // boolean 속성의 경우 attribute의 value(string)와 DOM 프로퍼티의 value(boolean)의 타입이 다르기때문에 동기화 이슈가 생겨 둘다 업데이트해줌
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

    if (isEvent(key) && typeof nextVal === "function") {
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

    if (nextVal == null) element.removeAttribute(key);
    else element.setAttribute(key, String(nextVal));
  }
}
