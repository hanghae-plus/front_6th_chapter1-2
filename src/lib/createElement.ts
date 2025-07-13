import { addEvent } from "./eventManager";
import type { Primitive, VNode } from "../types";

// 파라미터로 배열이 올 수도 있고, 단일 vNode가 올 수도 있음
export function createElement(vNode: VNode | Primitive | (VNode | Primitive)[]): Node {
  const isEmpty = vNode == null || typeof vNode === "boolean";
  if (isEmpty) return document.createTextNode("");

  const isPrimitive = typeof vNode === "string" || typeof vNode === "number";
  if (isPrimitive) return document.createTextNode(String(vNode));

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => fragment.appendChild(createElement(child)));

    return fragment;
  } else {
    if (typeof vNode.type === "function") throw new Error("normalize 되지 않은 Custom component는 사용할 수 없습니다.");

    const element = document.createElement(vNode.type);
    updateAttributes(element, vNode.props);
    (vNode.children || []).forEach((child) => {
      element.appendChild(createElement(child));
    });

    return element;
  }
}

function updateAttributes(element: HTMLElement, props: Record<string, any> | null | undefined): void {
  if (!props) return;

  Object.entries(props).forEach(([key, value]) => {
    if (value == null) return;

    const isEventHandler = /^on[A-Z]/.test(key) && typeof value === "function";
    if (isEventHandler) {
      const eventType = key.slice(2).toLowerCase();
      addEvent(element, eventType, value);
      return;
    }

    if (key === "className" || key === "class") {
      element.className = String(value);
      return;
    }

    const isDataAttribute = key.startsWith("data-");
    if (isDataAttribute) {
      const convertToCamelCase = (str: string) => {
        return str.toLowerCase().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      };
      // js dataset에 맞추기 위해 카멜케이스로 변환
      const dataKey = convertToCamelCase(key.slice(5));
      element.dataset[dataKey] = String(value);
      return;
    }

    if (typeof value === "boolean") {
      // any를 사용한 실용적인 이유: HTMLElement에 어떤 속성이 들어올지는 현재 단계에서 추측할 수 없으며 복잡한 타이핑을 하기보다는 과제 본직에 집중하기 위함
      //boolean 속성의 경우 attribute의 value(string)와 DOM 프로퍼티의 value(boolean)의 타입이 다르기때문에 동기화 이슈가 생겨 둘다 업데이트해줌
      (element as any)[key] = value;
      // 속성의 존재만 확인하면되므로 value에 빈스트링을 넣어줌
      if (value) element.setAttribute(key, "");
      else element.removeAttribute(key);
      return;
    }

    // 기타 일반 속성
    element.setAttribute(key, String(value));
  });
}
