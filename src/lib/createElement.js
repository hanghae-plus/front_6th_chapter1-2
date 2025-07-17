import { addEvent } from "./eventManager";

// element생성
// createElement()
// let element = document.createElement(tagName)

// text node 생성
// let textNode = document.createTextNode(data)

export function createElement(vNode) {
  if (vNode === undefined || vNode === null || vNode === false || vNode === true) {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    for (const child of vNode) {
      fragment.appendChild(createElement(child));
    }
    return fragment;
  }
  if (vNode.type) {
    const el = document.createElement(vNode.type);

    // // props 처리
    // for (const [key, value] of Object.entries(vNode.props || {})) {
    //   el.setAttribute(key, value);
    // }
    updateAttributes(el, vNode.props ?? {});

    // children 처리
    for (const child of vNode.children || []) {
      el.appendChild(createElement(child)); // 여기서도 재귀
    }
    return el;
  }
  // 컴포넌트 === 함수를 createElement로 처리하려고 하면 throw Error
  if (typeof vNode === "function") {
    throw Error;
  }
}

function updateAttributes($el, props) {
  for (const [key, value] of Object.entries(props)) {
    if (key === "className") {
      $el.className = value;
    } else if (key === "style") {
      $el.style.cssText = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.toLowerCase().slice(2);
      addEvent($el, eventType, value);
    } else if (typeof value === "boolean") {
      $el[key] = value;
    } else {
      $el.setAttribute(key, value);
    }
  }
}

// function createElement(vnode):
//   IF vnode가 null/undefined/boolean:
//     RETURN document.createTextNode('')

//   IF vnode가 string/number:
//     RETURN document.createTextNode(String(vnode))

//   IF vnode가 배열:
//     DocumentFragment 생성
//     각 요소를 createElement로 재귀 변환하여 추가
//     RETURN fragment

//   IF vnode.type이 함수:
//     ERROR 발생 (정규화 후 사용하라고 안내)

//   ELSE (HTML 태그):
//     element = document.createElement(vnode.type)
//     updateAttributes(element, vnode.props) 호출
//     각 child를 createElement로 재귀 변환하여 appendChild
//     RETURN element

// function updateAttributes(element, props):
//   props의 각 [key, value]에 대해:
//     IF key가 'on'으로 시작하고 value가 함수:
//       eventType = key에서 'on' 제거 후 소문자화
//       addEvent(element, eventType, value) 호출

//     ELSE IF key가 'className':
//       IF value 존재: element.setAttribute('class', value)
//       ELSE: element.removeAttribute('class')

//     ELSE IF key가 'style'이고 value가 객체:
//       Object.assign(element.style, value)

//     ELSE IF key가 boolean 속성들 (checked, disabled, selected):
//       IF value가 true: element[key] = true, setAttribute도 설정
//       ELSE: element[key] = false, removeAttribute 호출

//     ELSE IF 일반 속성:
//       IF value 존재: element.setAttribute(key, value)
