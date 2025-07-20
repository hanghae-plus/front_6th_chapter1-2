# createVNode

JSX 를 직접 만든 createVNode 함수를 사용해 객체로 변환하는 테스트를 진행합니다.
vite 설정을 통해 JSX 문법을 직접 만든 createVNode 함수를 통해 변환 하도록 되어있습니다.

- [테스트 진행 하기](#test-case)
- [createVNode](#createVNode-role)

<a id="test-case"></a>

## 테스트 진행 하기

### 1. 올바른 구조의 vNode를 생성해야 한다

```js
it("올바른 구조의 vNode를 생성해야 한다", () => {
  const vNode = createVNode("div", { id: "test" }, "Hello");
  expect(vNode).toEqual({
    type: "div",
    props: { id: "test" },
    children: ["Hello"],
  });
});
```
type, props, children 세 정보를 객체의 형태로 리턴을 하면 통과하는 테스트이다.

```js
export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children,
  };
}
```

입력 받은 값을 객체의 형태로 리턴한다.

### 2. 여러 자식을 처리해야 한다

```js
it("여러 자식을 처리해야 한다", () => {
  const vNode = createVNode("div", null, "Hello", "world");
  expect(vNode.children).toEqual(["Hello", "world"]);
});
```

요소의 자식이 여러개인 경우도 처리해 준다.
JS 에서는 파라미터의 개수가 정해지지 않는 경우 rest parameters 문법을 사용할 수 있다.

> [MDN Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)

기본으로 제공된 함수 형태가 children 을 rest parameters 형태로 받고 있기 때문에, 별다른 수정 없이 통과할 수 있다.


### 3. 자식 배열을 평탄화해야 한다

```js
it("자식 배열을 평탄화해야 한다", () => {
  const vNode = createVNode("div", null, ["Hello", ["world", "!"]]);
  expect(vNode.children).toEqual(["Hello", "world", "!"]);
});
```

children 로 중첩된 배열 형태가 들어오는 경우 1차원 배열의 형태로 만들어 줘야 한다.
배열의 평탄화는 Array 의 flat 매서드를 활용할 수 있다. 입력 받는 배열의 깊이를 알 수 없어 Number.POSITIVE_INFINITY 를 사용했다.

```js
export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: children.flat(Number.POSITIVE_INFINITY),
  };
}
```

> [Array.prototype.flat()]
> flat 매서드 보다 push를 활용하는 것이 빠르다고 하는데 왜 그럴까?


### 4. 중첩 구조를 올바르게 표현해야 한다

```js
it("중첩 구조를 올바르게 표현해야 한다", () => {
  const vNode = createVNode("div", null, createVNode("span", null, "Hello"), createVNode("b", null, "world"));
  expect(vNode.type).toBe("div");
  expect(vNode.children.length).toBe(2);
  expect(vNode.children[0].type).toBe("span");
  expect(vNode.children[1].type).toBe("b");
});
```

children 값으로 createVNode 함수가 리턴한 결과물을 받고 있다.
이전 조건을 만족한다면 수정 없이 통과할 수 있다.

### 5. JSX로 표현한 결과가 createVNode 함수 호출과 동일해야 한다

```js
describe("JSX로 표현한 결과가 createVNode 함수 호출과 동일해야 한다", () => {
  const TestComponent = ({ message }) => <div>{message}</div>;
  const ComplexComponent = ({ items, onClick }) => (
    <div className="container">
      {items.map((item) => (
        <span key={item.id}>{item.text}</span>
      ))}
      <button onClick={onClick}>Click me</button>
    </div>
  );

  it.each([
    {
      name: "기본적인 단일 엘리먼트",
      vNode: <div>Hello</div>,
      expected: {
        type: "div",
        props: null,
        children: ["Hello"],
      },
    },
    {
      name: "속성이 있는 엘리먼트",
      vNode: (
        <div id="test" className="container">
          Content
        </div>
      ),
      expected: {
        type: "div",
        props: { id: "test", className: "container" },
        children: ["Content"],
      },
    },
    {
      name: "중첩된 엘리먼트",
      vNode: (
        <div id="parent">
          <span className="child">Child</span>
        </div>
      ),
      expected: {
        type: "div",
        props: { id: "parent" },
        children: [
          {
            type: "span",
            props: { className: "child" },
            children: ["Child"],
          },
        ],
      },
    },
    {
      name: "배열 렌더링",
      vNode: (
        <ul>
          {[1, 2, 3].map((n, index) => (
            <li key={n}>
              Item {index}: {n}
            </li>
          ))}
        </ul>
      ),
      expected: {
        type: "ul",
        props: null,
        children: [
          {
            type: "li",
            props: { key: 1 },
            children: ["Item ", 0, ": ", 1],
          },
          {
            type: "li",
            props: { key: 2 },
            children: ["Item ", 1, ": ", 2],
          },
          {
            type: "li",
            props: { key: 3 },
            children: ["Item ", 2, ": ", 3],
          },
        ],
      },
    },
    {
      name: "함수형 컴포넌트",
      vNode: <TestComponent message="Hello World" />,
      expected: {
        type: TestComponent,
        props: { message: "Hello World" },
        children: [],
      },
    },
    {
      name: "이벤트 핸들러가 있는 엘리먼트",
      vNode: <button onClick={() => {}}>Click</button>,
      expected: {
        type: "button",
        props: { onClick: expect.any(Function) },
        children: ["Click"],
      },
    },
    {
      name: "조건부 렌더링",
      vNode: (
        <div>
          {true && <span>Shown</span>}
          {false && <span>Hidden</span>}
        </div>
      ),
      expected: {
        type: "div",
        props: null,
        children: [{ type: "span", props: null, children: ["Shown"] }],
      },
    },
    {
      name: "복잡한 컴포넌트 구조",
      vNode: (
        <ComplexComponent
          items={[
            { id: 1, text: "First" },
            { id: 2, text: "Second" },
          ]}
          onClick={() => {}}
        />
      ),
      expected: {
        type: ComplexComponent,
        props: {
          items: [
            { id: 1, text: "First" },
            { id: 2, text: "Second" },
          ],
          onClick: expect.any(Function),
        },
        children: [],
      },
    },
    {
      name: "null과 undefined 처리",
      vNode: (
        <div>
          {null}
          {undefined}
          <span>Valid</span>
        </div>
      ),
      expected: {
        type: "div",
        props: null,
        children: [{ type: "span", props: null, children: ["Valid"] }],
      },
    },
  ])("$name", ({ vNode, expected }) => {
    expect(vNode).toEqual(expected);
  });
});
```

테스트 코드가 길게 작성되어 있는데, 부분 부분 잘라서 확인해 보자

```js
it.each([
  // ...테스트 케이스
])("$name", ({ vNode, expected }) => {
  expect(vNode).toEqual(expected);
})
```

`it.each` 와 `expect` 부분을 확인해 보면, vNode의 값과 expected의 값이 같아야 하는 테스트 이다.

`it.each` 에 들어있는 항목들을 살펴보면, `vNode` 에는 JSX로 표현한 결과 값이 들어있고, `expected` 에는 객체 형태의 결과 값이 들어있다.

대부분의 케이스는 이전에 작성한 코드로 통과가 가능하기 때문에 실패 케이스만 다뤄보겠다.

### 조건부 렌더링과 nullish 값 처리

```js
{
  name: "조건부 렌더링",
  vNode: (
    <div>
      {true && <span>Shown</span>}
      {false && <span>Hidden</span>}
    </div>
  ),
  expected: {
    type: "div",
    props: null,
    children: [{ type: "span", props: null, children: ["Shown"] }],
  },
}

{
  name: "null과 undefined 처리",
  vNode: (
    <div>
      {null}
      {undefined}
      <span>Valid</span>
    </div>
  ),
  expected: {
    type: "div",
    props: null,
    children: [{ type: "span", props: null, children: ["Valid"] }],
  },
}
```

조건을 만족하기 위해 flat 을 한 이후 filter 를 통해 처리할 수 있다.

```js
export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: children.flat(Number.POSITIVE_INFINITY).filter((v) => v != null && v !== false),
  };
}
```

배열을 두 번 순회하는 것을 개선하고 싶어 `flattenRenderableChildren` 라는 함수를 별도로 만들었다.

```js
export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: flattenRenderableChildren(children),
  };
}

function isRenderable(child) {
  return child != null && child !== false;
}

function flattenRenderableChildren(children) {
  const result = [];

  const flatten = (value) => {
    if(is)

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        flatten(value[i]);
      }
    } else if (isRenderable(value)) {
      result.push(value);
    }
  };

  flatten(children);
  return result;
}
```

flatten 구현 부분은 es-toolkit 의 구현을 참고했다. 문서에 따르면 flat 매서드를 사용하는 것 보다 빠르다고 한다.

>[es-toolkit flatten 구현 코드](https://github.com/toss/es-toolkit/blob/main/src/array/flatten.ts)

<a id="createVNode-role"></a>

## createVNode 의 역할

createVNode 함수는 JSX 문법으로 작성된 코드를 가상 DOM 노드를 표현하는 객체 형태로 만드는 역할을 한다!

#### type

가상 DOM 노드가 어떤 요소인지 나타낸다. 일반적인 div, span 과 같은 값일 수 있고, 컴포넌트를 나타내는 함수나 클래스가 될 수도 있다.

#### props

해당 요소나 컴포넌트에 전달되는 속성을 담는 객체이다. HTML 속성이나 컴포넌트에서 정의한 값이 해당한다.


#### children

자식 요소를 나타낸다. 자식 요소는 1차원 배열 형태로 처리해야 한다. JSX 문법은 자식 요소를 자유롭게 전달할 수 있기 때문에 몇 가지 상황을 고려해야 한다.

- rest parameters: 하나가 아닌 여러 입력 값을 처리해야 한다.
- 중첩된 배열: 중첩된 배열을 1차원 배열로 평탄화 해야 한다.
- 렌더링 되지 않는 값: false 나 nullish 와 같은 렌더링이 필요없는 값을 필터링 해야 한다.
