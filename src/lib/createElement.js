import { addEvent } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";

const BOOLEAN_PROPS = ["checked", "disabled", "selected", "readOnly"];

/**
 * 주어진 DOM 엘리먼트의 속성(attribute)과 프로퍼티(property)를 업데이트합니다.
 * @param {HTMLElement} el - 속성을 업데이트할 DOM 엘리먼트
 * @param {Record<string, any>} props - 엘리먼트에 적용할 속성들이 담긴 객체
 * @returns {void}
 */
function updateAttributes(el, props) {
  for (const [key, value] of Object.entries(props)) {
    // 이벤트 핸들러
    if (key.startsWith("on") && typeof value === "function") {
      addEvent(el, key.slice(2).toLowerCase(), value);
      continue;
    }

    // 클래스
    if (key === "className") {
      el.className = value || "";
      continue;
    }

    // Boolean 속성 (예: disabled, checked)
    if (BOOLEAN_PROPS.includes(key)) {
      el[key] = !!value;
      if (value) el.setAttribute(key, "");
      else el.removeAttribute(key);
      continue;
    }

    // Style 객체
    if (key === "style" && typeof value === "object") {
      Object.assign(el.style, value);
      continue;
    }

    // Data 속성 (예: data-id)
    if (key.startsWith("data-")) {
      const dataKey = key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      el.dataset[dataKey] = value;
      continue;
    }

    // 나머지 일반 속성
    el.setAttribute(key, value);
  }
}

/**
 * 가상 노드(VNode)를 실제 DOM 엘리먼트로 변환합니다.
 * @param {object|Array<any>|string|number|boolean|null} vNode - 변환할 가상 노드
 * @returns {HTMLElement|Text|DocumentFragment} 생성된 실제 DOM 노드
 */
export function createElement(vNode) {
  // vNode가 배열인 경우, DocumentFragment를 사용하여 자식들을 묶습니다.
  if (Array.isArray(vNode)) {
    const $el = document.createDocumentFragment();
    for (const node of vNode) {
      $el.appendChild(createElement(node));
    }
    return $el;
  }

  // null, undefined, boolean 처리
  if (vNode == null || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // VNode 정규화 (normalizeVNode는 외부에서 가져온 함수로 가정)
  const normalized = normalizeVNode(vNode);

  // 정규화된 VNode가 문자열이나 숫자이면 텍스트 노드를 생성
  if (typeof normalized === "string" || typeof normalized === "number") {
    return document.createTextNode(normalized);
  }

  // 정규화된 VNode가 배열이면, 각 항목에 대해 재귀적으로 createElement를 호출
  if (Array.isArray(normalized)) {
    const $el = document.createDocumentFragment();
    for (const node of normalized) {
      $el.appendChild(createElement(node));
    }
    return $el;
  }

  // 함수형 컴포넌트는 지원하지 않음을 명시
  if (typeof vNode === "object" && typeof vNode.type === "function") {
    throw new Error("Function component is not supported in this function.");
  }

  // 엘리먼트를 생성
  const $el = document.createElement(normalized.type);

  // 엘리먼트에 속성 적용
  updateAttributes($el, normalized.props ?? {});

  // 자식 노드들을 재귀적으로 생성하여 추가
  for (const child of normalized.children ?? []) {
    $el.appendChild(createElement(child));
  }

  return $el;
}
