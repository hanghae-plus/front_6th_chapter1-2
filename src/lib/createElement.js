export function createElement(vNode) {
  console.log("createElement", vNode);
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
    const componentVNode = vNode.type(vNode.props || {});
    return createElement(componentVNode); // 재귀 호출
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

  console.log("$el", $el);

  return $el;
}

function updateAttributes($el, props) {
  if (!props) return;

  // props의 각 key-value 반복하며 DOM에 적용
  Object.entries(props).forEach(([key, value]) => {
    if (key === "className") {
      // className은 DOM의 className 속성에 직접 할당
      $el.className = value;
    } else {
      // 그 외의 속성은 setAttribute로 추가
      $el.setAttribute(key, value);
    }
  });
}
