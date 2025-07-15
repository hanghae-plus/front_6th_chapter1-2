// 2025071403
// DocumentFragment = "여러 개의 HTML 요소들을 임시로 모아두는 가상의 상자" document.createDocumentFragment();

// import { addEvent } from "./eventManager";

export function createElement(vNode) {
  //   IF vnode가 null/undefined/boolean:
  //     RETURN document.createTextNode('')
  if (vNode === null || vNode === undefined || vNode === true) {
    return document.createTextNode("");
  }
  //   IF vnode가 string/number:
  //     RETURN document.createTextNode(String(vnode))
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }
  //   IF vnode가 배열:
  if (Array.isArray(vNode)) {
    //     DocumentFragment 생성
    const fragment = document.createDocumentFragment();

    // 각 요소를 createElement로 재귀 변환하여 추가
    vNode.forEach((element) => {
      const childElement = createElement(element);
      fragment.appendChild(childElement);
    });

    // RETURN fragment
    return fragment;
  }
  //   IF vnode.type이 함수:
  //     ERROR 발생 (정규화 후 사용하라고 안내)
  //   ELSE (HTML 태그):
  //     element = document.createElement(vnode.type)
  //     updateAttributes(element, vnode.props) 호출
  //     각 child를 createElement로 재귀 변환하여 appendChild
  //     RETURN element
}

// function updateAttributes($el, props) {
//   // function updateAttributes(element, props):
//   // props의 각 [key, value]에 대해:
//   //   IF key가 'on'으로 시작하고 value가 함수:
//   //     eventType = key에서 'on' 제거 후 소문자화
//   //     addEvent(element, eventType, value) 호출
//   //   ELSE IF key가 'className':
//   //     IF value 존재: element.setAttribute('class', value)
//   //     ELSE: element.removeAttribute('class')
//   //   ELSE IF key가 'style'이고 value가 객체:
//   //     Object.assign(element.style, value)
//   //   ELSE IF key가 boolean 속성들 (checked, disabled, selected):
//   //     IF value가 true: element[key] = true, setAttribute도 설정
//   //     ELSE: element[key] = false, removeAttribute 호출
//   //   ELSE IF 일반 속성:
//   //     IF value 존재: element.setAttribute(key, value)
// }
