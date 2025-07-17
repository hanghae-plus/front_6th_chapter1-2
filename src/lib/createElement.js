import { addEvent } from "./eventManager";

export function createElement(vNode) {
  console.log(vNode);
  const isFalsyVNodeValue = (value) => value == null || typeof value === "boolean";
  const isPrimitive = (value) => typeof value === "string" || typeof value === "number";

  if (isFalsyVNodeValue(vNode)) {
    return document.createTextNode("");
  }

  if (isPrimitive(vNode)) {
    return document.createTextNode(String(vNode));
  }

  // 배열이 들어오면 DocumentFragment로 변환
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => fragment.appendChild(createElement(child))); // 각 자식을 재귀적으로 DOM으로 변환해서 추가
    return fragment;
  }

  // 💡 함수형 컴포넌트 처리
  if (typeof vNode.type === "function") {
    throw new Error("함수형 컴포넌트는 createElement로 처리할 수 없습니다. 렌더링 함수에서 호출해야 합니다.");
  }

  // 객체(vNode)가 들어오면 실제 DOM 요소 생성
  const $el = document.createElement(vNode.type);

  updateAttributes($el, vNode.props);

  // 자식(children) 처리: 각 자식을 재귀적으로 DOM으로 변환해서 추가
  if (vNode.children) {
    vNode.children.forEach((child) => {
      $el.appendChild(createElement(child));
    });
  }

  console.log(" $el", $el);

  return $el;
}

//배포
function updateAttributes($el, props) {
  if (!props) return;

  Object.entries(props).forEach(([key, value]) => {
    if (key === "className") {
      $el.className = value;
    } else if (/^on[A-Z]/.test(key) && typeof value === "function") {
      // 이벤트 핸들러는 addEventListener로 등록
      const eventType = key.slice(2).toLowerCase();
      addEvent($el, eventType, value);
    } else if (typeof value === "boolean") {
      // 불리언 속성은 true일 때만 설정
      if (value) {
        $el.setAttribute(key, "");
        $el[key] = true; // 실제 DOM 속성도 설정
      }
    } else if (value != null) {
      // null/undefined가 아닌 경우만 setAttribute
      $el.setAttribute(key, value);
    }
  });
}
