본 글은 Gemini cli와 Cursor ai의 답변을 참고로 작성했습니다.

## 1. 가상돔의 가독성을 개선하기 위해 만들어진 문법이 JSX

JSX를 사용하는 이유를 단순히 js보다 직관적이고 가독성이 좋아서라고 생각
왜 가독성 좋은 문법이 필요했을까? 

#### JSX가 없던 시절: 함수 중첩의 지옥
초기 Virtual DOM 환경에서 UI를 만들기 위해서는 h()(hyperscript)나 createElement와 같은 함수를 사용해 DOM 구조를 표현

```js
 // JSX가 없을 때
 createElement(
   h('div', { id: 'app' },
     h('ul', null,
       h('li', null, 'todo list item 1'),
       h('li', null, 'todo list item 2')
     ),
     h('form', /* ... */)
   )
 );
 ```

- 가독성 저하
- 유지보수 난이도

특히 state 나 동적인 목록을 다루어야 할 때 이러한 단점이 두드러짐.

#### JSX
- 개발자가 UI의 "구조"와 "로직"에만 집중할 수 있도록 해준다.
- 브라우저가 직접 이해하지 못하는 JSX 코드를 Babel과 같은 트랜스파일러가 Virtual DOM 객체(즉, h() 함수 호출)로 변환 -> 개발자의 편의성 + 기계의 효율성


## 2. virtualDOM 에서 정규화가 필요한 이유

1. 개발자의 편의성 vs 기계의 효율성
- 컴포넌트는 다음과 같이 다양한 형태의 값을 반환할 수 있다.
    - 문자열 또는 숫자: return "Hello World"
    - 배열: return [ h('div', 'item 1'), h('div', 'item 2') ]
    - null 또는 boolean: 조건부 렌더링을 위해 return null
    - 단일 가상 노드(`vnode`) 객체: return h('div', 'Hello')

> 개발자에게는 이러한 유연성이 편리하지만 렌더링 엔진(diffing 알고리즘)입장에서는 복잡한 문제이다. 
이전 가상돔과 새로운 가상돔을 비교할 때, 비교 로직은 이러한 if/else 분기처리를 해야만 한다. → 성능 저하를 야기
> 

그렇기 때문에 반환되는 다양한 형태의 `vnode`들을 렌더링 엔진이 처리하기 쉬운 표준화된 구조로 변환한다.

정규화를 거친 후 diffing 알고리즘 입장

> 모든 `vnode`는 `type` , `props` , `children` 을 갖는 객체
> 

**따라오는 이점**

- 예측 가능성
- 일관된 구조 → 유지보수성 증가
- 개발자 경험(DX) 유지
- 알고리즘 단순화
    
    → 복잡한 조건 분기 없이 일관된 방식으로 노드를 비교하기 때문에 알고리즘이 명확하고 단순해진다.
    

**비유를 해보자**

> 건축가가 건설팀에게 어떤 것은 완벽한 설계도로, 어떤 것은 손으로 그린 스케치로, 또 어떤 것은 말로만 전달한다면? 

 건설팀은 일을 시작하기 전에 이 모든 것을 표준화된 설계 도면으로 통일하는 작업을 먼저 할 것이다.
 여기서 **정규화**가 바로 그 **'설계 도면 통일'** 작업에 해당하고, **diffing알고리즘**은 그 통일된 도면을 보고 건물을 짓는 **'건설팀'**에 해당

### nNode 타입이 function일 때, children을 포함해서 재귀를 넘겨야 하는 이유

**JSX 구조상 children은 필수이다.**

왜 필수일까? 다음 두 가지를 살펴보면 알 수 있다.

1. 테스트 코드 JSX 구조 
    
    ```jsx
    const TestComponent = () => (
      <UnorderedList>
        <ListItem id="item-1">Item 1</ListItem>
        <ListItem id="item-2">Item 2</ListItem>
        <ListItem id="item-3" className="last-item">Item 3</ListItem>
      </UnorderedList>
    );
    ```
    
    이 JSX는 다음과 같이 변환된다.
    
    ```jsx
    {
      type: UnorderedList,
      props: null,
      children: [
        { type: ListItem, props: { id: "item-1" }, children: ["Item 1"] },
        { type: ListItem, props: { id: "item-2" }, children: ["Item 2"] },
        { type: ListItem, props: { id: "item-3", className: "last-item" }, children: ["Item 3"] }
      ]
    }
    ```
    

1. 함수형 컴포넌트의 children 의존성
    
    ```jsx
    const UnorderedList = ({ children, ...props }) => <ul {...props}>{children}</ul>;
    ```
    
    - `children` prop을 받아야 한다.
    - 받은 `children`을 `<ul>` 안에 렌더링 해야 한다.
    - `children`이 없으면 빈 `<ul></ul>`만 렌더링 된다.
    

**이 때, children을 넘기지 않는다면?**

```jsx
UnorderedList({})  // children prop이 없음
↓
<ul>{undefined}</ul>  // children이 undefined
↓
{ type: 'ul', props: {}, children: [undefined] }
↓
{ type: 'ul', props: {}, children: [] }  // undefined가 필터링됨
```

즉, 탐색해야 할 트리(JSX의 자식 요소)를 넘겨주지 않아서 올바르게 탐색되지 않는 문제가 발생한다.

**children을 전달한다면!**

```jsx
UnorderedList({ 
  children: [
    { type: ListItem, props: { id: "item-1" }, children: ["Item 1"] },
    { type: ListItem, props: { id: "item-2" }, children: ["Item 2"] },
    { type: ListItem, props: { id: "item-3", className: "last-item" }, children: ["Item 3"] }
  ]
})
↓
<ul>
  <li id="item-1">Item 1</li>
  <li id="item-2">Item 2</li>
  <li id="item-3" className="last-item">Item 3</li>
</ul>
```

트리(JSX)를 끝까지 순회할 수 있다.

결론
 함수형 컴포넌트는 자신이 감싸고 있는 자식(children)들을 어떻게 렌더링할지
  정의하는 '설계도'와 같습니다. 이 설계도를 기반으로 실제 DOM을 만들려면,
  설계도(컴포넌트 함수)에게 재료(`children`)를 반드시 전달해야 한다.


  만약 vNode의 children을 컴포넌트 함수에 넘기지 않으면, 컴포넌트는 렌더링할
  대상을 잃어버립니다. 그 결과, 자식 노드들에 대한 렌더링이 중단되고 전체 JSX
  트리를 끝까지 순회할 수 없게 되어 화면이 올바르게 그려지지 않는다.


  따라서 함수형 컴포넌트를 처리할 때는, 재귀적인 렌더링 흐름을 유지하기 위해
  vNode의 children을 해당 컴포넌트 함수에 인자(props)로 전달해야 한다.

### DocumentFragment가 뭘까!

- “가벼운 DOM 컨테이너”
- DOM 트리의 일부를 담을 수 있는 경량화 된 문서 객체이며, DOM에 삽입되기 전까지는 메모리상에만 존재한다.
- 즉, DOM API의 일부이며 DOM 노드들을 임시로 담는 컨테이너!

한마디로 “메모리 상에만 존재하는, 계산을 위한 임시 컨테이너”

### **DocumentFragment가 필요한 이유**

1. DOM의 조작 비용
- Layout Reflow
    
    ```jsx
    // DOM에 요소를 추가할 때마다 브라우저가 레이아웃을 다시 계산
    const container = document.getElementById('container');
    
    // 비효율적인 방법
    for (let i = 0; i < 1000; i++) {
      const div = document.createElement('div');
      div.textContent = `Item ${i}`;
      container.appendChild(div);  // 매번 레이아웃 리플로우 발생!
    }
    ```
    
    - 각 appendChild 호출마다 브라우저가 전체 페이지 레이아웃을 다시 계산한다.
    - 1000번의 리플로우 발생
    - 성능 저하 초래.
- Painting
    
    ```jsx
    // DOM 변경 시마다 화면을 다시 그려야 함
    const container = document.getElementById('container');
    
    // 비효율적인 방법
    container.appendChild(div1);  // 페인팅 1회
    container.appendChild(div2);  // 페인팅 2회
    container.appendChild(div3);  // 페인팅 3회
    container.appendChild(div4);  // 페인팅 4회
    // 총 4번의 페인팅 발생
    ```
    

DocumentFragment를 사용한 최적화 (성능 비교)

```jsx
// 성능 측정 예시
console.time('Without Fragment');
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  container.appendChild(div);  // 1000번의 DOM 조작
}
console.timeEnd('Without Fragment');

console.time('With Fragment');
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  fragment.appendChild(div);  // fragment에 추가 (DOM 조작 없음)
}
container.appendChild(fragment);  // 1번의 DOM 조작
console.timeEnd('With Fragment');

// 결과: With Fragment가 훨씬 빠름
```

- 즉, DOM 변경마다 브라우저가 전체 레이아웃을 다시 계산해야 하는 과정을 DocumentFragment를 사용하여 필요한 조작만 수행하여 DOM 조작 비용을 줄인다.
- 여러 요소를 한 번에 처리하여 성능을 최적화한다.
    
    ```jsx
    // DocumentFragment의 실제 사용 예시
    const fragment = document.createDocumentFragment();
    
    // 여러 요소를 fragment에 추가
    fragment.appendChild(document.createElement('div'));
    fragment.appendChild(document.createElement('span'));
    fragment.appendChild(document.createElement('p'));
    
    // 한 번에 실제 DOM에 삽입
    container.appendChild(fragment);
    // 결과: 3개의 요소가 한 번에 container에 추가됨
    ```
    

### DocumentFragment를 사용하는 이유

- 실제 DOM에 여러 DOM 요소를 **한 번에 삽입** 하기 위해 (배치 처리)
- DOM 조작 횟수를 줄여 **리플로우를 최소화**하기 위해

즉, 실제 DOM을 생성하는 과정에서 성능 최적화를 위해 사용하는 도구이다.

### $el.setAttribute는 **DOM 속성 메서드**

### updateElement의 index는 어떤 역할?

```jsx
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // index는 현재 노드가 부모의 몇 번째 자식인지를 나타냄
  // 이를 통해 DOM에서 정확한 위치의 노드를 찾을 수 있음
}
```

### DOM 속성으로 설정 vs HTML 속성으로 설정
이 두 속성은 HTML 어트리뷰트(Attribute)가 아닌 DOM 프로퍼티(Property)로 직접 설정해야만 의도대로 동작하고 성능상 이점을 가진다.
```jsx
    if (key === "className") {
      $el.className = value;
      continue;
    }

    if (key === "value") {
      $el.value = value;
      continue;
    }
```

#### 1. HTML 어트리뷰트와 DOM 프로퍼티의 차이
 - HTML 어트리뷰트 (Attribute):
    - HTML 문서가 처음 로드될 때의 초기값입니다.
    - HTML 태그에 class="item", value="초기값"처럼 작성된 정적인 값입니다.
    - element.setAttribute('class', 'new-item')을 통해 변경할 수 있습니다.

- DOM 프로퍼티 (Property):
    - HTML이 파싱되어 생성된 DOM 객체의 현재 상태를 나타내는 살아있는
      값입니다.
    - JavaScript로 element.className, element.value처럼 접근하고 변경할 수
      있는 동적인 값입니다.

  대부분의 경우 어트리뷰트를 변경하면 프로퍼티도 변경되는 등 둘은 동기화되지만,
  `className`과 `value`는 중요한 예외 케이스입니다.

<br/>

#### 2. 왜 className을 프로퍼티로 설정해야 할까?
```js
if (key === "className") {
   $el.className = value;
   continue;
}
```

 - 예약어 충돌 방지: 가장 큰 이유는 JavaScript의 예약어(reserved word) 충돌
  때문입니다. class는 JavaScript에서 클래스를 선언하는 키워드이므로, DOM API
  설계자들은 HTML class 어트리뷰트에 해당하는 DOM 프로퍼티의 이름을
  className으로 정했습니다.
- 표준 접근 방식: 따라서 JavaScript 코드 내에서 요소의 클래스를 제어할 때는
  element.className 프로퍼티를 사용하는 것이 표준적이고 직접적인 방법입니다.
  setAttribute('class', ...)보다 이 방법이 더 권장됩니다.

<br/>

#### 3. 왜 value를 프로퍼티로 설정해야 할까? (가장 중요)
```js
if (key === "value") {
   $el.value = value;
   continue;
}
```

> value는 어트리뷰트와 프로퍼티의 차이가 가장 극명하게 드러나는 속성

- 어트리뷰트는 오직 '초기값': HTML value 어트리뷰트는 `<input>`이나 `<textarea>` 같은 폼 요소의 초기값만 설정
- 프로퍼티는 '현재값': 사용자가 `<input>` 필드에 직접 타이핑하면, 화면에 보이는 값과 DOM `value` 프로퍼티는 실시간으로 변경.
  이때 HTML `value` 어트리뷰트는 개발자 도구에서 확인해봐도 초기값 그대로 남아있다.


따라서, 현재 입력 창의 값을 동적으로 제어하려면 반드시 `$el.value` 프로퍼티를 직접 변경해야 한다.


만약 $el.setAttribute('value', ...)를 사용하면 단지 초기값만 변경할 뿐, 사용자의 입력으로 이미 변경된 '현재 값'을 덮어쓰지 못할 수 있다.
이는 React의 '제어 컴포넌트(Controlled Component)'가 동작하는 핵심 원리이기도 하다.

#### 결론
- `className`: 예약어 충돌을 피하고 표준적인 DOM API를 사용하기 위해
  프로퍼티로 직접 설정
- `value`: 초기값이 아닌, 사용자의 입력까지 반영하는 '현재의 살아있는 값'을
  올바르게 제어하기 위해 프로퍼티로 직접 설정

