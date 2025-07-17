# createElement

Node를 생성하는 createElement 함수를 구현한다.

- [테스트 진행 하기](#test-case)
- [createElement 의 역할](#createElement-role)

<a id="test-case"></a>

## 테스트 진행 하기

```js
let container;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
});
```

>createElement 함수 구현 테스트는 각 테스트 실행 전/후 작업이 설정되어 있다.

### nullish, boolean 값은 빈 텍스트 노드로 변환된다.

```js
it.each([
  [undefined, ""],
  [null, ""],
  [false, ""],
  [true, ""],
])("%s는 빈 텍스트 노드로 변환된다.", (input, expected) => {
  const result = createElement(input);
  expect(result.nodeType).toBe(Node.TEXT_NODE);
  expect(result.textContent).toBe(expected);
});
```

nullish 값과 boolean 값이 들어오면 빈 텍스트 노드를 리턴하는 코드를 작성한다.

```js
export function createElement(vNode) {
  if (isNullish(vNode) || isBoolean(vNode)) {
    return document.createTextNode("");
  }
}

function isNullish(value) {
  return value === null || value === undefined;
}

function isBoolean(value) {
  return typeof value === "boolean";
}
```

텍스트 노드를 생성할 때 `Text 생성자` 를 사용하는 방법과, `document.createTextNode` 매서드를 사용하는 방법이 존재한다. 과제를 진행할 때 일관성을 위해 `document` 매서드를 사용했다.

>- [MDN Text: Text() constructor](https://developer.mozilla.org/en-US/docs/Web/API/Text/Text)
>- [MDN Document: createTextNode() method](https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode)

### 문자열과 숫자는 텍스트 노드로 변환된다.

```js
it.each([
  ["Hello", "Hello"],
  [42, "42"],
  [0, "0"],
  [-0, "0"],
  [10000, "10000"],
])("%s은 텍스트 노드로 변환된다.", (input, expected) => {
  const result = createElement(input);
  expect(result.nodeType).toBe(Node.TEXT_NODE);
  expect(result.textContent).toBe(expected);
});
```

문자열과 숫자는 텍스트 노드를 리턴하는 코드를 작성한다.

```js
export function createElement(vNode) {
  if (isNullish(vNode) || isBoolean(vNode)) {
    return document.createTextNode("");
  }

  if (isString(vNode)) {
    // 문자열은 문자열 값 그대로 사용
    return document.createTextNode(vNode);
  }

  if (isNumber(vNode)) {
    // 숫자는 문자열로 변환해준다.
    // return document.createTextNode(vNode.toString());
    return document.createTextNode(vNode.toString());
  }
}

function isNullish(value) {
  return value === null || value === undefined;
}

function isBoolean(value) {
  return typeof value === "boolean";
}

function isString(value) {
  // 문자열 확인
  return typeof value === "string";
}

function isNumber(value) {
  // 숫자 확인
  return typeof value === "number";
}
```

### 배열 입력에 대해 DocumentFragment를 생성해야 한다

```js
it("배열 입력에 대해 DocumentFragment를 생성해야 한다", () => {
  const result = createElement([<div>첫 번째</div>, <span>두 번째</span>]);

  expect(result.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
  expect(result.childNodes.length).toBe(2);
  expect(result.childNodes[0].tagName).toBe("DIV");
  expect(result.childNodes[1].tagName).toBe("SPAN");
});
```
DocumentFragment 를 생성하고, 자식 노드로 Element Node 를 추가하는 코드를 작성한다. Element Node 를 생성할 때 입력받은 type 을 사용한다.

```js
export function createElement(vNode) {
  if (isNullish(vNode) || isBoolean(vNode)) {
    return document.createTextNode("");
  }

  if (isString(vNode)) {
    return document.createTextNode(vNode);
  }

  if (isNumber(vNode)) {
    return document.createTextNode(vNode.toString());
  }

  if (Array.isArray(vNode)) {
    const fragment = new DocumentFragment();
    for (let i = 0; i < vNode.length; i++) {
      const { type } = vNode[i];
      const $element = document.createElement(type);
      fragment.appendChild($element);
    }
    return fragment;
  }
}

function isNullish(value) {
  return value === null || value === undefined;
}

function isBoolean(value) {
  return typeof value === "boolean";
}

function isString(value) {
  return typeof value === "string";
}

function isNumber(value) {
  return typeof value === "number";
}
```

DocumentFragment 를 활용하면 여러 노드를 묶을 수 있다. React 의 Fragment 를 생각하면 된다.

>- [MDN DocumentFragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment)
>- [MDN Document: createElement() method](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)

### 컴포넌트를 createElement로 처리하려고 하면 오류가 발생한다

```js
it("컴포넌트를 createElement로 처리하려고 하면 오류가 발생한다.", () => {
  const FuncComponent = ({ text }) => <div>{text}</div>;
  expect(() => createElement(<FuncComponent text="Hello" />)).toThrowError();
});
```

JSX 인지 확인하는 함수를 만들고, JSX 인 경우 컴포넌트인지 확인 한다.
컴포넌트인 경우 TypeError 를 던진다.

이전에 작성한 JSX 를 Element Node로 만드는 부분도 수정한다.

```js
export function createElement(vNode) {
  if (isNullish(vNode) || isBoolean(vNode)) {
    return document.createTextNode("");
  }

  if (isString(vNode)) {
    return document.createTextNode(vNode);
  }

  if (isNumber(vNode)) {
    return document.createTextNode(vNode.toString());
  }

  if (Array.isArray(vNode)) {
    const fragment = new DocumentFragment();
    for (let i = 0; i < vNode.length; i++) {
      // 이전 코드에서 Element Node 를 생성하는 부분을 변경해준다.
      const $el = createElement(vNode[i]);
      fragment.appendChild($el);
    }
    return fragment;
  }

  if (isJSX(vNode)) {
    // JSX 인 경우 createElementFromJSX 함수를 사용한다.
    return createElementFromJSX(vNode);
  }
}

function createElementFromJSX(vNode) {
  // JSX 를 Element Node 로 만든다.
  const { type } = vNode;

  if (isFunction(type)) {
    // normalizeVNode 를 거치지 않은 컴포넌트는 예외 처리를 한다.
    throw new TypeError("createElement 함수는 컴포넌트를 처리할 수 없습니다.");
  }

  return document.createElement(type);
}

function isNullish(value) {
  return value === null || value === undefined;
}

function isBoolean(value) {
  return typeof value === "boolean";
}

function isString(value) {
  return typeof value === "string";
}

function isNumber(value) {
  return typeof value === "number";
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
```

### 컴포넌트를 정규화한 다음에 createElement로 생성할 수 있다

```js
it("컴포넌트를 정규화한 다음에 createElement로 생성할 수 있다.", () => {
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

  expect(createElement(normalizeVNode(<TestComponent />)).outerHTML).toEqual(
    `<ul><li id="item-1" class="list-item ">- Item 1</li><li id="item-2" class="list-item ">- Item 2</li><li id="item-3" class="list-item last-item">- Item 3</li></ul>`,
  );
});
```

JSX 를 Element Node 로 생성할 때 props 값을 설정한다.
children 으로 받은 값 또한 Element Node 로 생성하고 자식 노드로 추가해준다.

```js
function setAttributes($el, props) {
  // props 값을 설정하는 함수

  if (props === null) {
    return;
  }

  const entries = Object.entries(props);

    for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    const isValidValue = isString(value) || isNumber(value) || isBoolean(value);

    if (!isValidValue) {
      continue;
    }

    switch (key) {
      case "className":
        $el.className = value;
        break;

      case "children":
        // children 의 경우 속성로 설정하지 않는다.
        break;

      default:
        $el.setAttribute(key, value);
        break;
    }
  }
}

function updateChildren($el, children) {
  for (let i = 0; i < children.length; i++) {
    if (!isNullish(children[i])) {
      const $child = createElement(children[i]);
      $el.appendChild($child);
    }
  }
}

function createElementFromJSX(vNode) {
  const { type, props, children } = vNode;

  if (isFunction(type)) {
    throw new TypeError("createElement 함수는 컴포넌트를 처리할 수 없습니다.");
  }

  const $el = document.createElement(type);
  setAttributes($el, props);
  updateChildren($el, children);
  return $el;
}
```

이전 과정에서 children 에 대한 처리를 해주었기 때문에 아래 테스트 들도 코드 수정 없이 통과가 가능합니다.

```js
it("중첩된 자식 요소를 올바르게 처리해야 한다", () => {
  const result = createElement(
    <div>
      <span>Hello</span>
      <b>world</b>
    </div>,
  );
  expect(result.tagName).toBe("DIV");
  expect(result.childNodes.length).toBe(2);
  expect(result.childNodes[0].tagName).toBe("SPAN");
  expect(result.childNodes[1].tagName).toBe("B");
});

it("깊게 중첩된 구조를 처리해야 한다", () => {
  const result = createElement(
    <div>
      <span>
        <a href="#">링크</a>
        <b>굵게</b>
      </span>
      <p>문단</p>
    </div>,
  );
  expect(result.tagName).toBe("DIV");
  expect(result.childNodes.length).toBe(2);
  expect(result.childNodes[0].tagName).toBe("SPAN");
  expect(result.childNodes[0].childNodes.length).toBe(2);
  expect(result.childNodes[0].childNodes[0].tagName).toBe("A");
  expect(result.childNodes[0].childNodes[1].tagName).toBe("B");
  expect(result.childNodes[1].tagName).toBe("P");
});

it("혼합 콘텐츠(텍스트와 요소)를 처리해야 한다", () => {
  const result = createElement(
    <div>
      텍스트
      <span>span 안의 텍스트</span>더 많은 텍스트
    </div>,
  );
  expect(result.tagName).toBe("DIV");
  expect(result.childNodes.length).toBe(3);
  expect(result.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
  expect(result.childNodes[1].tagName).toBe("SPAN");
  expect(result.childNodes[2].nodeType).toBe(Node.TEXT_NODE);
});

it("빈 자식 배열을 처리해야 한다", () => {
  const result = createElement(<div>{[]}</div>);
  expect(result.tagName).toBe("DIV");
  expect(result.childNodes.length).toBe(0);
});

it("undefined 자식을 무시해야 한다", () => {
  const result = createElement(<div>{undefined}</div>);
  expect(result.tagName).toBe("DIV");
  expect(result.childNodes.length).toBe(0);
});

it("불리언 속성을 처리해야 한다", () => {
  const result = createElement(<input disabled={true} />);
  expect(result.tagName).toBe("INPUT");
  expect(result.disabled).toBe(true);
});
```

### 불리언 속성을 처리해야 한다

```js
it("불리언 속성을 처리해야 한다", () => {
  const result = createElement(<input disabled={true} />);
  expect(result.tagName).toBe("INPUT");
  expect(result.disabled).toBe(true);
});
```

일부 속성의 경우 일반적인 속성 설정과 차이점이 존재한다.
React 를 사용할 때 `<button type="button" disabled={true|false}>버튼</button>` 이런 식으로 disabled 값을 설정했을 것 이다. disabled 값이 boolean 이라 생각할 수 있는데, 실제 DOM 에선 속성이 존재하느냐만 판단한다. 그렇기 때문에 위 테스트 코드의 `true` 값을 `false` 로 변경하면 테스트를 실패하는 걸 확인할 수 있다.

이와 같이 속성의 존재 여부만 판단하는 값들이 있는데, 이러한 값에 대해선 별개의 처리를 해주어야 한다.

```js
...

const knownBooleanAttributeMap = new Map([
  // [JSX 속성 이름, DOM 속성 이름]
  // 실제론 더 많은 속성을 설정해야 함
  ["disabled", "disabled"],
]);

function setAttributes($el, props) {
  if (props === null) {
    return;
  }

  const entries = Object.entries(props);

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    const isValidValue = isString(value) || isNumber(value) || isBoolean(value);

    if (!isValidValue) {
      continue;
    }

    switch (key) {
      case "className":
        $el.className = value;
        break;

      case "children":
        break;

      default:
        if (knownBooleanAttributeMap.has(key)) {
          // 속성의 존재 여부만 파악하는 값들
          setKnownBooleanAttributes($el, knownBooleanAttributeMap.get(key), value);
          break;
        }

        $el.setAttribute(key, value);
        break;
    }
  }
}

...
```

### 데이터 속성을 처리해야 한다

```js
it("데이터 속성을 처리해야 한다", () => {
  const result = createElement(<div data-test="값" />);
  expect(result.tagName).toBe("DIV");
  expect(result.dataset.test).toBe("값");
});
```

데이터 속성도 setAttribute 매서드로 설정이 되기 때문에 별개의 처리를 해주지 않아도 통과한다.

>[MDN HTMLElement: dataset property](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset)


### 최종 수정

```js
export function createElement(vNode) {
  if (isString(vNode) || isNumber(vNode)) {
    // createTextNode 매서드는 내부적으로 입력 받은 값을 문자열로 변환한다. number 를 문자열로 바꾸는 과정을 제거했다.
    return document.createTextNode(vNode);
  }

  if (Array.isArray(vNode)) {
    const fragment = new DocumentFragment();
    for (let i = 0; i < vNode.length; i++) {
      const $el = createElement(vNode[i]);
      fragment.appendChild($el);
    }
    return fragment;
  }

  if (isJSX(vNode)) {
    return createElementFromJSX(vNode);
  }

  // 위 조건에 해당되지 않으면 빈 문자열 노드를 리턴
  // 기존 nullish 조건 제거
  return document.createTextNode("");
}
```

<a id="createElement-role"></a>

## createElement 의 역할

createElement 함수는 객체 형태의 가상 DOM 을 실제 DOM 요소로 만드는 역할을 한다.

### 노드를 사용하는 이유

노드를 사용하는 경우 다음과 같은 장점이 있다.

#### 입력 받은 데이터를 순수한 문자열로만 취급한다.

innerHTML 을 사용하는 경우 할당된 문자열을 HTML로 파싱하는 과정을 거치는데, 이 과정에서 문자열에 포함된 스크립트 태그가 실행될 수 있다. 하지만 노드를 생성하는 매서드들은 입력받은 데이터를 파싱하지 않지 때문에 상대적으로 안전하다.

> textContent 또한 XSS 공격에 대해 안전하다
> [MDN Node: textContent property](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)

#### 다양한 노드 매서드를 사용할 수 있다.

우선 노드에 대해 알아보자

노드는 DOM을 구성하는 가장 기본적인 단위를 의미한다. DOM은 트리 구조로 표현되는데, 이 트리를 이루는 각 요소들이 노드이다.

노드의 특징
- 계층 구조: 모든 노드는 부모 - 자식 - 형제 관계를 가지며 트리 구조이다.
- 정보 저장: 각 노드는 웹 문서의 특정 부분을 나타내며, 해당 부분에 대한 정보를 담고 있다.
- 접근/조작 가능: 자바스크립트를 통해 DOM 트리에 있는 모든 노드에 접근할 수 있다. 또한 노드를 추가, - 삭제, 수정할 수 있다.

텍스트 노드 또한 노드의 한 종류이기 때문에 노드 인터페이스가 제공하는 다양한 매서드를 사용할 수 있다.

주요 속성 및 메서드
- 노드 탐색: parentNode, childNodes, firstChild, lastChild, nextSibling, previousSibling
- 노드의 종류와 값: nodeType, nodeName, nodeValue
- 추가/제거/교체/삽입: appendChild(), removeChild(), replaceChild(), insertBefore()

이런 인터페이스는 DOM 을 편리하게 다룰 수 있게 해준다.

### 노드를 생성하는 방법

노드를 생성할 때 document 매서드를 사용하는 방식과, 노드의 생성자를 활용하는 방식이 있다.

텍스트 노드를 예로 들면 `document.createTextNode()` 이렇게 document 매서드를 사용하는 방식이 있고, `new Text()` 이렇게 생성자를 사용하는 방식이 있다. 두 가지 결과값은 모두 동일하다. 단 예외적으로 Element 요소를 생성하기 위해서는 `document.createElement()` 매서드만 사용할 수 있다.

> 과제를 진행할 땐 일관성을 위해 document 매서드를 사용했다.

### 속성 설정하기

#### setAttribute

Element 노드에 속성을 설정할 땐 setAttribute 매서드를 사용할 수 있다.

setAttribute 매서드의 특징은 키와 값으로 문자열을 받는다. 그리고 이 문자열을 Element 노드에 추가하거나 변경한다.

주의할 점은 href, src, action, xlinkHref 와 같이 자바스크립트 스킴을 실행할 수 있는 속성에는 XSS 를 대비해야 한다.

> - [MDN Element: setAttribute() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute)
> - [MDN javascript: URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/javascript)

#### className vs setAttribute

클래스네임을 설정할 때 둘 중 어떤걸 사용해야 할까?

className 의 경우 클래스네임을 다루기 위한 별도의 기능인 만큼 사용하는 이유가 명확하다 생각했다. setAttribute 의 경우 다른 속성들을 설정하는 것과 일관성을 유지할 수 있다고 생각했다. 리액트의 경우 어떻게 처리했는지 궁금해져서 코드를 찾아봤다.

```js
...
case 'className':
  setValueForKnownAttribute(domElement, 'class', value);
...

export function setValueForKnownAttribute(...) {
  ...
  node.setAttribute(
    name,
    enableTrustedTypesIntegration ? (value: any) : '' + (value: any),
  );
}
```

리액트에서는 setValueForKnownAttribute 라는 함수를 통해, value 에 대한 예외처리 과정을 거치고 setAttribute 를 사용해 속성 값을 설정한다. 함수 이름으로 유추해 보면 JSX 에서 명시적으로 사용중인 속성 값을 설정하는데 쓰이는 것 같다.

> - [(ReactDOMComponent.js#L383) case 'className':](https://github.com/facebook/react/blob/97cdd5d3c33eda77be4f96a43f72d6916d3badbb/packages/react-dom-bindings/src/client/ReactDOMComponent.js#L383)
> - [(DOMPropertyOperations.js#L134) setValueForKnownAttribute](https://github.com/facebook/react/blob/97cdd5d3c33eda77be4f96a43f72d6916d3badbb/packages/react-dom-bindings/src/client/DOMPropertyOperations.js#L134)

#### 존재 여부만 확인하는 속성들

일부 속성의 경우 일반적인 속성 설정과 차이점이 존재한다.
React 를 사용할 때 `<button type="button" disabled={true|false}>버튼</button>` 이런 식으로 disabled 값을 설정했을 것 이다. disabled 값이 boolean 이라 생각할 수 있는데, 실제 DOM 에선 속성이 존재하는지 안 하는지만 판단한다. 그렇기 때문에 disabled=false 라는 값을 설정해도 disabled 는 true 로 인식된다.

이와 같이 속성의 존재 여부만 판단하는 값들이 있는데, 이러한 값에 대해선 별개의 처리를 해주어야 한다.

> 리액트 코드 확인하기 [ReactDOMComponent.js#L712](https://github.com/facebook/react/blob/97cdd5d3c33eda77be4f96a43f72d6916d3badbb/packages/react-dom-bindings/src/client/ReactDOMComponent.js#L712)

#### JSX 에서 작성한 인라인 스타일도 변환이 필요할 것 이다.

나중에 시간이 된다면 해보기