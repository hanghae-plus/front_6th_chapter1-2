import { toCamelCase } from "../utils";
import { addEvent } from "./eventManager";

/**
 * VNode(가상 노드)를 실제 DOM 엘리먼트로 변환
 *
 * - 함수형 컴포넌트: 예외 발생(정규화 필요)
 * - null, undefined, boolean, true: 빈 텍스트 노드로 변환
 * - string, number: 텍스트 노드로 변환
 * - 배열: DocumentFragment로 변환(각 자식 재귀)
 * - VNode 객체: 엘리먼트 생성, props/children 재귀 적용
 */
export function createElement(vNode) {
  if (typeof vNode?.type === "function") {
    throw new Error("컴포넌트는 createElement에서 직접 처리할 수 없습니다. 먼저 normalizeVNode로 정규화해 주세요.");
  }

  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => fragment.appendChild(createElement(child)));
    return fragment;
  }

  const element = document.createElement(vNode.type);
  updateAttributes(element, vNode.props);

  const children = vNode.children ?? [];
  children.forEach((child) => element.appendChild(createElement(child)));

  return element;
}

/**
 * 실제 DOM 엘리먼트에 속성을 적용
 *
 * - className: class 속성으로 변환
 * - on*: 이벤트 핸들러는 addEvent로 위임 등록
 * - checked, disabled, selected, readOnly: Boolean 속성 처리
 * - style: 객체일 경우 style 속성에 병합
 * - 나머지: setAttribute로 일반 속성 처리
 */
function updateAttributes($el, props) {
  props = props || {};

  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;

    // className → class 속성으로 변환
    if (key === "className") {
      value ? $el.setAttribute("class", value) : $el.removeAttribute("class");
      continue;
    }

    // onClick, onChange 등 이벤트 핸들러는 addEvent로 위임 등록
    if (key.startsWith("on") && typeof value === "function") {
      addEvent($el, key.slice(2).toLowerCase(), value);
      continue;
    }

    // checked, disabled, selected, readOnly 처리
    if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
      $el[key] = Boolean(value);
      value ? $el.setAttribute(key, "") : $el.removeAttribute(key);
      continue;
    }

    // style 객체는 style 속성에 병합
    if (key === "style") {
      Object.assign($el.style, value);
      continue;
    }

    // data-* 속성은 dataset에 할당
    if (key.startsWith("data-")) {
      $el.dataset[toCamelCase(key.slice(5))] = value;
      continue;
    }

    $el.setAttribute(key, value);
  }
}
