// 2025071403
// DocumentFragment = "여러 개의 HTML 요소들을 임시로 모아두는 가상의 상자" document.createDocumentFragment();
// 2025071601
// ㅋ... ai를 활용하면 단위 테스트는 해결이 되는데 e2e는 해결이 안된다..
// 탈락인가... 실제 화면은 되게 잘 보이던데 뭘 놓친걸까...
// 재귀재귀재귀...

// import { addEvent } from "./eventManager";

export function createElement(vNode) {
  // 1. vNode가 null, undefined, boolean 일 경우, 빈 텍스트 노드를 반환합니다.
  if (vNode === null || vNode === undefined || typeof vNode === "boolean" || vNode === "") {
    return document.createTextNode("");
  }
  // 2. IF vnode가 string/number:vNode가 문자열이나 숫자면 텍스트 노드를 생성하여 반환합니다.
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }
  // 3. vNode가 배열이면 DocumentFragment를 생성하고 각 자식에 대해 createElement를 재귀 호출하여 추가합니다.
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();

    vNode.forEach((element) => {
      const childElement = createElement(element);
      fragment.appendChild(childElement);
    });

    return fragment;
  }

  // IF vnode.type이 함수:
  // ERROR 발생 (정규화 후 사용하라고 안내)
  // 함수형 컴포넌트 처리
  if (vNode.type === "function") {
    throw new Error("함수형 컴포넌트는 normalizeVNode로 정규화 후 사용하세요.");
  }

  // 4. 위 경우가 아니면 실제 DOM 요소를 생성합니다:
  //   - vNode.type에 해당하는 요소를 생성
  //   - vNode.props의 속성들을 적용 (이벤트 리스너, className, 일반 속성 등 처리)
  //   - vNode.children의 각 자식에 대해 createElement를 재귀 호출하여 추가
  // HTML 태그 처리
  //   ELSE (HTML 태그):
  //     element = document.createElement(vnode.type)
  //     updateAttributes(element, vnode.props) 호출
  //     각 child를 createElement로 재귀 변환하여 appendChild
  //     RETURN element
  if (vNode && vNode.type) {
    const element = document.createElement(vNode.type);
    updateAttributes(element, vNode.props);

    if (vNode.children && Array.isArray(vNode.children)) {
      vNode.children.forEach((child) => {
        const childElement = createElement(child);
        if (childElement) {
          element.appendChild(childElement);
        }
      });
    }

    console.log("updateAttributes", vNode);
    return element;
  }
}

function updateAttributes(element, props) {
  if (!props) return;

  Object.entries(props).forEach(([key, value]) => {
    // 이벤트 핸들러 처리
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      element.addEventListener(eventType, value);
    }
    // className 처리
    else if (key === "className") {
      element.setAttribute("class", value);
    }
    // style 객체 처리
    else if (key === "style" && typeof value === "object") {
      Object.assign(element.style, value);
    }
    // boolean 속성 처리
    else if (typeof value === "boolean" && ["checked", "disabled", "selected"].includes(key)) {
      if (value) {
        element.setAttribute(key, "");
        element[key] = true;
      } else {
        element.removeAttribute(key);
        element[key] = false;
      }
    }
    // 기타 모든 속성 처리
    else if (value != null) {
      element.setAttribute(key, value);
    }
  });
}
