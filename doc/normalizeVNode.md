# normalizeVNode

데이터를 일관된 형태로 만들어 주는 normalizeVNode 함수를 구현 한다.

- [테스트 진행 하기](#test-case)
- [normalizeVNode 의 역할](#normalizeVNode-role)

<a id="test-case"></a>

## 테스트 진행 하기

### null, undefined, boolean 값은 빈 문자열로 변환되어야 한다

```js
it.each([
  [null, ""],
  [undefined, ""],
  [true, ""],
  [false, ""],
])("null, undefined, boolean 값은 빈 문자열로 변환되어야 한다. (%s)", (input, expected) => {
  expect(normalizeVNode(input)).toBe(expected);
});
```

nullish 한 값과, boolean 값은 빈 문자열을 리턴하도록 추가한다.

```js
export function normalizeVNode(vNode) {
  if (isNullish(vNode) || isBoolean(vNode)) {
    return "";
  }

  return vNode;
}

function isNullish(value) {
  return value == null;
}

function isBoolean(value) {
  return typeof value === "boolean";
}
```

### 문자열과 숫자는 문자열로 변환되어야 한다

```js
it.each([
  ["hello", "hello"],
  [123, "123"],
  [0, "0"],
  [-42, "-42"],
])("문자열과 숫자는 문자열로 변환되어야 한다. (%s)", (input, expected) => {
  expect(normalizeVNode(input)).toBe(expected);
});
```

문자열은 이미 문자열이기 때문에, 숫자만 문자열로 변화하는 과정을 추가한다.

```js
export function normalizeVNode(vNode) {
  if (isNullish(vNode) || isBoolean(vNode)) {
    return "";
  }

  if (isNumber(vNode)) {
    // number 타입은 문자열로 변환
    return vNode.toString();
  }

  return vNode;
}

function isNullish(value) {
  return value == null;
}

function isBoolean(value) {
  return typeof value === "boolean";
}

// 타입이 number 인지 확인
function isNumber(value) {
  return typeof value === "number";
}
```

### 컴포넌트를 표준화한다

```js
it("컴포넌트를 표준화한다.", () => {
  const UnorderedList = ({ children, ...props }) => <ul {...props}>{children}</ul>;
  const ListItem = ({ children, className, ...props }) => (
    <li {...props} className={`list-item ${className ?? ""}`}>
      - {children}
    </li>
  );
  const TestComponent = () => (
    <UnorderedList>
      <ListItem id="item-1">Item 1</ListItem>
      <ListItem id="item-2">Item 2</ListItem>
      <ListItem id="item-3" className="last-item">
        Item 3
      </ListItem>
    </UnorderedList>
  );

  const normalized = normalizeVNode(<TestComponent />);

  expect(normalized).toEqual(
    <ul {...{}}>
      <li id="item-1" className="list-item ">
        {"- "}Item 1
      </li>
      <li id="item-2" className="list-item ">
        {"- "}Item 2
      </li>
      <li id="item-3" className="list-item last-item">
        {"- "}Item 3
      </li>
    </ul>,
  );
});
```

컴포넌트는 이전에 만든 createVNode 를 통해 객체 형태로 변한이 된다.

toEqual 에 들어있는 JSX 를 콘솔로 찍어본다.

```JSON
{
  "type": "ul",
  "props": {},
  "children": [
    { "type": "li", "props": { "id": "item-1", "className": "list-item" }, "children": ["- ", "Item 1"] },
    { "type": "li", "props": { "id": "item-2", "className": "list-item" }, "children": ["- ", "Item 2"] },
    { "type": "li", "props": { "id": "item-3", "className": "list-item last-item" }, "children": ["- ", "Item 3"] },
  ],
}
```

ul 와 li 이 혼합되어 있어 복잡해 보인다. 우선 ul 만 가지고 테스트를 진행해 본다.

```js
...

const TestComponent = () => <UnorderedList></UnorderedList>;

...

expect(normalized).toEqual(<ul {...{}}></ul>);
```

TestComponent 컴포넌트를 UnorderedList 만 렌더링 하도록 변경했다.
toEqual 로 비교하는 부분도 ul 태그만 남겨 두었다.

간소화한 TestComponent 의 경우 아래 형태를 맞춰주면 된다.

```JSON
{"type":"ul","props":{},"children":[]}
```

`<TestComponent />` 를 로그로 찍어보면 아래와 같은 형태로 나온다.

```js
{ type: [Function: TestComponent], props: null, children: [] }
```

로그를 살펴보면 type 에 해당하는 [Function: TestComponent] 부분은 자바스크립트에서 TestComponent 라는 이름의 함수를 로그로 출력했다는 의미이다. 이걸 JS 코드로 변환하면 아래와 같이 표현할 수 있다.

```js
const TestComponent = () => <UnorderedList></UnorderedList>;
{ type: TestComponent, props: null, children: [] }
```

type 값에 함수가 할당되어 있는 형태이기 때문에 type를 함수로 호출할 수 있다.
함수를 호출하면 TestComponent() 이런 형태가 될 것 이다.

함수를 호출할 때 고려할 점이 있는데, 리액트에서 함수형 컴포넌트를 만들 때 함수의 인자를 { children, ...props } 와 같은 형태로 받는 다는 걸 알고 있다. 이 경험을 고려하면 함수를 호출할 때 children 과 props 값을 넘겨줘야 할 것 이다.

이때 TestComponent() 가 리턴하는 값과, children 의 값은 어떤 값이 올지 알 수 없다. 따라서 표준화를 해줘야 한다.

이 과정을 코드로 작성해 준다.

```js
export function normalizeVNode(vNode) {
  if (isNullish(vNode) || isBoolean(vNode)) {
    return "";
  }

  if (isNumber(vNode)) {
    return vNode.toString();
  }

  if (isFunction(vNode.type)) {
    // 컴포넌트인 경우 실행
    return normalizeComponent(vNode);
  }

  return vNode;
}

function isNullish(value) {
  return value == null;
}

function isBoolean(value) {
  return typeof value === "boolean";
}

function isNumber(value) {
  return typeof value === "number";
}

function isFunction(value) {
  return typeof value === "function";
}

function normalizeComponent(vNode) {
  // 컴포넌트의 경우 createVNode 로 변환된 객체 형태이다.
  const { type, props, children } = vNode;

  // 컴포넌트가 반환하는 값이 무엇인지 알 수 없기 때문에 표준화를 해준다.
  return normalizeVNode(
    type({
      ...(props ?? {}),
      children: children.map(
        // children 값 또한 무엇인지 알 수 없기 때문에 표준화 과정이 필요하다.
        (child) => normalizeVNode(child)),
    }),
  );
}
```

### Falsy 값 (null, undefined, false)은 자식 노드에서 제거되어야 한다.

```js
it.only("Falsy 값 (null, undefined, false)은 자식 노드에서 제거되어야 한다.", () => {
  const normalized = normalizeVNode(
    <div>
      유효한 값{null}
      {undefined}
      {false}
      {true}
      <span>자식 노드</span>
    </div>,
  );

  expect(normalized).toEqual(
    <div>
      유효한 값<span>자식 노드</span>
    </div>,
  );
});
});
```

JSX 를 표준화 하고, 표준화 후 children 에 있는 비어있는 문자열은 제거해야 한다.

이전에 작성한 컴포넌트 표준화는 type 이 문자열이 상황을 고려하지 않았기 때문에 문자열인 상황도 고려하도록 변경한다. 추가적으로 JSX 인지 확인하는 함수를 추가한다.

```js
export function normalizeVNode(vNode) {
  if (isNullish(vNode) || isBoolean(vNode)) {
    return "";
  }

  if (isNumber(vNode)) {
    return vNode.toString();
  }

  if (isJSX(vNode)) {
    // JSX 표준화 하기
    return normalizeJSX(vNode);
  }

  return vNode;
}

function isNullish(value) {
  return value == null;
}

function isBoolean(value) {
  return typeof value === "boolean";
}

function isNumber(value) {
  return typeof value === "number";
}

function isString(value) {
  return typeof value === "string";
}

function isFunction(value) {
  return typeof value === "function";
}

function isJSX(value) {
  if (typeof value !== "object" || value === null) {
    // 객체 형태가 아니면 JSX 가 아니다.
    return false;
  }

  if (!("type" in value) || !("props" in value) || !("children" in value)) {
    // 객체 형태이지만 필수 프로퍼티가 없으면 JSX 가 아니다.
    return false;
  }

  if (!(isString(value.type) || isFunction(value.type))) {
    // type 값이 문자열 또는 함수가 아니면 JSX 가 아니다.
    // 현재는 함수형 컴포넌트만 고려
    return false;
  }

  if (typeof value.props !== "object") {
    // props 값이 객체가 아니면 JSX 가 아니다.
    return false;
  }

  if (!Array.isArray(value.children)) {
    // children 값이 배열이 아니면 JSX 가 아니다.
    return false;
  }

  return true;
}

function normalizeJSX(vNode) {
  const { type, props, children } = vNode;

  if (isFunction(type)) {
    // 함수인 경우 이전 컴포넌트 표준화와 같은 방식으로 처리한다.
    return normalizeVNode(
      type({
        ...(props ?? {}),
        children: normalizeChildren(children),
      }),
    );
  }

  // type 이 문자열인 경우 type을 그대로 리턴한다.
  return {
    type,
    props,
    children: normalizeChildren(children),
  };
}

function normalizeChildren(children) {
  // children 에 속한 값들을 표준화 하면서, 비어있는 문자열은 포함시키지 않는다.
  const result = [];

  const normalize = (value) => {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeVNode(value[i]);

      if (normalized) {
        result.push(normalized);
      }
    }
  };

  normalize(children);
  return result;
}
```

<a id="normalizeVNode-role"></a>

## normalizeVNode 의 역할

normalizeVNode 함수는 데이터를 표준화된 형태로 만들어 준다!

> 여기서 normalize 이라는 의미는 정규화 보다 표준화/정형화 라는 의미에 더 가깝다


### 데이터 표준화가 필요한 이유

왜 이러한 과정이 필요할까?

JSX 문법은 개발자에게 유연성을 제공한다. 이러한 유연성은 개발을 하는 사람에겐 편리함을 가져다 주지만 JSX 의 결과물을 다뤄야 하는 곳에선 결과물을 예측하기 어렵게 만든다 한다.

예를 들어 표준화 되지 않은 데이터를 가지고 JSX 를 사용해 select 를 구현한다고 생각해 보자. 
option 을 만들기 위한 데이터가 어떤 형태로 존재하는지, 각 요소에 렌더링 되지 않아야 하는 값은 없는지 select 의 동작 과는 별개로 입력받은 데이터의 처리를 고려해야 한다. 만약 데이터가 표준화 되어 있다면, 온전히 select 를 구현하는데 더 집중할 수 있을 것 이다.

가상 돔을 구현할 때도 데이터가 표준화 되어 있어야 렌더링이나 비교 등의 과정에서 온전히 본인의 역할에 집중할 수 있다.
