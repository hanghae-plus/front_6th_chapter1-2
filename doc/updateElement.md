# updateElement

어떤 경우 돔을 업데이트 해야 할까?

현재 사용중인 가상 돔의 구조를 보면...

{
  type: "div" // "span", "a", ..., 이외 컴포넌트 함수들
  props: {} // 속성
  children: [] // 자식 요소들
}

우선 type이 변하면 요소를 다시 그려야 할 것 이다.
props 의 변화는 props 만 추가/삭제/변경 하면 될 것 같다.
children 의 경우 순회하면서 type, props, childrens 을 비교 하면 될 것 같다.

updateElement 함수를 살펴보자
```js
export function updateElement(parentElement, newNode, oldNode, index = 0) {  
}
```

parentElement 는 renderElement 에서 container 에 해당할 것 같다.
newNode, oldNode 부분은 이전 vNode 와 새로운 vNode 를 넣어주면 될 것 같다. index 는 무엇일까?? 기본값이 설정되어 있으므로 우선 3가지 값만 가지고 진행 해본다.

이전 vNode와 새로운 vNode를 비교하는 함수를 구현하기

```js
function checkSameVNode(newNode, oldNode) {
  if (!isJSX(newNode) || !isJSX(oldNode)) {
    throw new TypeError("newNode 또는 oldNode 가 JSX 가 아닙니다.");
  }

  if (newNode.type !== oldNode.type) {
    return false;
  }

  if (!checkSameProps(newNode.props, oldNode.props)) {
    return false;
  }

  if (newNode.children.length !== oldNode.children.length) {
    // ??
    return checkSameVNode();
  }

  return true;
}
```

이런 식으로 vNode가 같은지 확인하는 함수를 구현 중 이었다.
children 을 비교하려고 하다 보니, 자식 요소 중 하나라도 다른 것이 있다면 false 를 반환할 텐데..

updateElement 의 역할을 다시 생각해보면, createElement 처럼 vNode 를 Element 로 변경해야 하는 것이 아니라 바뀐 부분을 찾아서 dom api 를 활용해 일부분만 변경해야 하는 것 이다.

DOM 을 변경할 때 사용하는 API 들을 확인해보자
- 생성: 현재는 createElement 함수에서 한다
- 추가
  - parentNode.appendChild(child): 마지막 자식으로 추가한다.
  - parentNode.prepend(child1, child2, ...): 첫번째 자식으로 하나 이상의 노드를 추가할 수 있다.
  - parentNode.insertBefore(newChild, referenceChild): referenceChild 앞에 추가한다.
  - element.insertAdjacentElement(position, element): 
    - 'beforebegin': element 바로 앞에 (부모의 자식이 아님)
    - 'afterbegin': element의 첫 번째 자식으로
    - 'beforeend': element의 마지막 자식으로
    - 'afterend': element 바로 뒤에 (부모의 자식이 아님)
- 제거: 
  - parentNode.removeChild(child): 자식 요소를 제거한다.
  - child.remove(): 요소를 제거한다.
- 변경:
  - element.textContent: 텍스트 변경
  - element.innerHTML: 문자열을 파싱해서 변경
  - element.outerHTML: 자신을 포함한 innerHTML
  - parentNode.replaceChild(newChild, oldChild)

속성 변경
- setAttribute/removeAttribute

```js
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (!isVNode(newNode) || !isVNode(oldNode)) {
    throw new TypeError("newNode 또는 oldNode 가 vNode 가 아닙니다.");
  }

  const diffProps = getDiffProps(newNode.props, oldNode.props);

  if (!diffProps.count > 0) {
    const { removedProps, updatedProps } = diffProps;
    const $el = parentElement.children[index];

    for (const key in removedProps) {
      removeAttribute($el, key, removedProps[key]);
    }

    for (const key in updatedProps) {
      updateAttribute($el, key, updatedProps[key]);
    }
  }
}

function getDiffProps(newProps, oldProps) {
  const newPropsKeys = Object.keys(newProps ?? {});
  const oldPropsKeys = Object.keys(oldProps ?? {});
  const allKeys = new Set([...newPropsKeys, ...oldPropsKeys]);
  const removedProps = {};
  const updatedProps = {};

  for (const key of allKeys) {
    if (!(key in newProps)) {
      removedProps[key] = oldProps[key];
      continue;
    }

    if (newProps[key] !== oldProps[key]) {
      updatedProps[key] = newProps[key];
    }
  }

  return {
    removedProps,
    updatedProps,
    count: Object.keys(removedProps).length + Object.keys(updatedProps).length,
  };
}
```
속성을 변경/삭제하는 코드를 추가했다.
index는 DOM 에서 해당 노드를 가져오기 위해 필요한 값인 것 같다.

type 이 다르면 변경하는 코드를 작성해보자
parentNode.replaceChild(newChild, oldChild) 매서드를 사용하면 될 것 같다.


boolean 값에 대해 setAttribute 와 property 직접 설정

이전 자식 노드가 더 많은 경우
반복문을 돌 때 삭제하는 경우 i 값을 유지해야 함 ...

테스트는 통과 하는데 화면상으론 이상하다??

단순하게 다시 생각해보기

추가
- newNode 는 있고, oldNode 없으면 추가
변경
- newNode 있고, oldNode 있음
  - 두 타입이 같으면 props 업데이트
  - 두 타입이 다르면 oldNode 위치에 newNode로 변경
삭제
- newNode는 없고, oldNode는 있음

실수한 부분
반복문에서
parentElement.appendChild(createElement(newChild)); 해준것이 문제였다

```html
<div id="div">
  <div>
    <label>카테고리:</label>
    <button key="reset" data-breadcrumb="reset">전체</button>
  </div>
  <div>
    <button key="생활/건강" data-category1="생활/건강">생활/건강</button>
    <button key="디지털/가전" data-category1="디지털/가전">디지털/가전</button>
  </div>
</div>
```

```html
<div id="div">
  <div>
    <label>카테고리:</label>
    <button key="reset" data-breadcrumb="reset">전체</button>
  </div>
  <div>
    <button key="생활/건강" data-category1="생활/건강">생활/건강</button>
  </div>
  <button key="디지털/가전" data-category1="디지털/가전">디지털/가전</button>
</div>
```