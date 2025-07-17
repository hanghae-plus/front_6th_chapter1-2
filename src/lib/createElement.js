import { addEvent } from './eventManager.js';
import { ATTR, BOOLEAN_ATTR, CHECK_TYPES } from '../constants.js';

export function createElement(vNode) {
  // 함수형 컴포넌트 오류 발생 에러 추가
  if (typeof vNode === CHECK_TYPES.FUNCTION) {
    throw new Error('컴포넌트는 createElement로 처리할 수 없습니다.');
  }
  // null, undefined, boolean값에 빈 텍스트 노드로 반환
  if (vNode === null || vNode === undefined || vNode === true || vNode === false) {
    return document.createTextNode('');
  }
  // 숫자에 대해 텍스트 노드로 반환
  if (typeof vNode === CHECK_TYPES.STRING || typeof vNode === CHECK_TYPES.NUMBER) {
    return document.createTextNode(String(vNode));
  }
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => fragment.appendChild(createElement(child)));
    return fragment;
  }
  const elem = document.createElement(vNode.type);

  if (vNode.children) {
    vNode.children.forEach((child) => {
      const childElem = createElement(child);
      elem.appendChild(childElem);
    });
  }
  if (vNode.props) {
    updateAttributes(elem, vNode.props);
  }
  return elem;
}

function updateAttributes($el, props) {
  Object.entries(props).forEach(([key, value]) => {
    // 이벤트 핸들러 처리 우선순위 조정: onClick, onFocus 등 -> 이벤트 처리에 제일 많이 쓰일 것으로 보여 위로 올림
    if (key.startsWith('on') && typeof value === CHECK_TYPES.FUNCTION) {
      const eventType = key.slice(2).toLowerCase();
      addEvent($el, eventType, value);
      return;
    }

    // className => class 속성으로 변환
    if (key === ATTR.CLASSNAME) {
      $el.setAttribute(ATTR.CLASS, value);
      return;
    }

    // style 객체 처리
    if (key === ATTR.STYLE && typeof value === CHECK_TYPES.OBJECT) {
      Object.entries(value).forEach(([styleKey, styleValue]) => {
        $el.style[styleKey] = styleValue;
      });
      return;
    }

    // boolean 처리
    if (typeof value === CHECK_TYPES.BOOLEAN) {
      if (BOOLEAN_ATTR.includes(key)) {
        $el[key] = value;
      } else {
        $el.setAttribute(key, '');
        if (key in $el) $el[key] = value;
      }
      return;
    }

    if (key.startsWith('data-')) {
      // data-로 시작하는 속성에 대한 처리
      $el.setAttribute(key, value);
      return;
    }

    // 일반 속성 처리 - data-와 동일한 setAttribute 를 실행하지만,, 우선 분리
    $el.setAttribute(key, value);
  });
}
