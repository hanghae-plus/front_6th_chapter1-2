# Asynchronous 컴포넌트는 어떻게 처리해야할까?

현재 `normalizeVNode`에서 함수 컴포넌트를 처리할때 아래와 같은 코드로 처리가 되고있습니다.

```js
/**
 * 함수 컴포넌트 처리
 * 함수 컴포넌트는 자식 노드를 포함하는 객체를 반환하므로 재귀적으로 처리
 */
if (typeof vNode.type === "function") {
    const props = { ...vNode.props };
    if (vNode.children?.length > 0) {
        props.children = vNode.children.map((child) => normalizeVNode(child));
    }
    const result = vNode.type(props); //  🚨 Promise를 반환 하는경우 문제 발생
    return normalizeVNode(result);
}

async function AsynchronousComponent({ userId }) {
    const user = await findUserData(userId)

    return <div>Hello {user.name}!</div>
}
```

> `vNode.type(props)`가 Promise를 반환하게 되는 경우 `normalizeVNode(result)`가 동기적으로 처리되기때문에 result가 resolve되지 않은 상태에서 렌더링이 진행되어 정상적인 vNode 트리가 생성되지않거나 부수효과를 일으킬 가능성이 존재합니다.

result가 **Promise**인지 아닌지 확인도 하지않고 동기적으로 재귀호출하기때문에 잘못된 트리를 그리며 최악의 경우  type.props가 undefined일 수 있으므로 런타임에 에러를 낼 수 있습니다.

```js
const result = vNode.type(props); // 🚨 async component인 경우 Promise 반환
return normalizeVNode(result);    // ❌ 이 시점엔 아직 결과값이 없음
```

## 왜 문제인가

JSX 구조 자체는 함수 컴포넌트가 vNode를 반환한다는 Synchronous한 전제를 가지고있는데, Asynchronous Function은 이 전제를 깨트리고 비동기로 vNode를 반환하므로 await 하지 않는 이상 렌더링 루틴이 깨지게됩니다.

## 어떻게 해결할 수 있는가?

- `vNode.type(props)`가 thenable한지 체크를 한다.
  - await 혹은 체이닝으로 처리한다.
  - 처리하기 전까지는 fallback 처리로 렌더링 루틴을 깨트리지 않는다.

## normalizeVNode 수정

```js

class ThenableError extends Error {}

/**
 * 함수 컴포넌트 처리
 * 함수 컴포넌트는 자식 노드를 포함하는 객체를 반환하므로 재귀적으로 처리
 */
if (typeof vNode.type === "function") {
    const props = { ...vNode.props };
    if (vNode.children?.length > 0) {
        props.children = vNode.children.map((child) => normalizeVNode(child));
    }

    try {
        const result = vNode.type(props)

        if(isThenable(result)) {
            throw new ThenableError("Async components must be wrapped with createAsyncComponent");
        }

    } catch (error) {
        if(error instanceof ThenableError) {
            return createVNode(vNode.fallback)
        }
        throw error
    }
}
```


Asynchronous 컴포넌트가 resolve되지 않았을때 fallback UI를 보여주기 위한 방법입니다.

비동기 컴포넌트의 경우 기존 렌더링 루틴 `normalizeVNode`은 동작을 예측하기 어렵기때문에 아래의 처리가 필요합니다.

1. 렌더링 타이밍 제어

- async function Component()는 즉시 VNode를 반환하지 않고 잠시 후에 결과를 줌
- 이걸 감지하고 fallback UI를 먼저 보여준 뒤, 결과가 오면 다시 렌더해야 함

2. 예외 기반 흐름 제어

- React의 Suspense처럼 throw Promise로 제어 흐름을 탈출시킴
- SuspenseWrapper가 이 Promise를 캐치해서 fallback UI를 보여주는 방식


## 서스펜스 패턴 사용

```js
function SuspenseWrapper({ children, fallback, ...props }) {
    return createVNode(fallback, props, children)
}

function createAsyncComponent(asyncFn) {
  const cache = new Map();
  
  return function AsyncWrapper(props) {
    const cacheKey = JSON.stringify(props);
    
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (cached instanceof Promise) {
        throw cached; // Suspense가 캐치함
      }
      return cached;
    }
    
    const promise = asyncFn(props).then(result => {
      cache.set(cacheKey, result);
      // 리렌더링 트리거
      triggerRerender();
      return result;
    });
    
    cache.set(cacheKey, promise);
    throw promise; // Suspense가 캐치함
  };
}
```

```js
function createAsyncComponent(asyncFn) {
  const cache = new Map(); // 클로저
  
  return function () {
    ...나머지
  }
}
```

자세히 본다면 createAsyncComponent가 클로저를 사용하고있습니다. 클로저를 사용하는 이유는 캐시를 격리하기 위함입니다. 만약 전역 캐시를 사용하게된다면 같은 컴포넌트를 여러번 호출할 수도 있기때문에 각각의 props 조합마다 별도의 캐시가 필요할 수 있다고 생각합니다.

## 결론

Asynchronous 컴포넌트는 Promise를 반환하므로 vNode 렌더링 루틴에 직접 넣으면 트리가 깨질수있으므로 fallback -> resolvedVNode로 자연스럽게 전이될수있도록 설계해야합니다.

### AS-IS(Promise를 고려하지않은 vNode 트리 흐름)

```jsx
<App>
  <AsyncComponent>
</App>
```

```js
{
  type: App,
  props: {},
  children: [{ type: AsyncComponent }] // 🚨 Promise 반환 (async 컴포넌트)
}
```

```js
const result = vNode.type(props); // 🚨 Promise 반환 (async 컴포넌트)
return normalizeVNode(result);   // ❌ Promise는 처리 불가
```

### TO-BE(Promise를 고려하게된 vNode 트리 흐름)

```jsx
<App>
  <SuspenseWrapper fallback={<div>Loading...</div>}>
    <AsyncComponent>
  </SuspenseWrapper>
</App>
```


```js
{
  type: App,
  props: {},
  children: [
    { 
        type: SuspenseWrapper,
        props: {
            fallback: <div>Loading...</div>,
            children: [
                { type: AsyncComponent }
            ]
        }
    }] 
}
```

`normalizeVNode(SuspenseWrapper)`가 호출되면 아래와 같은 흐름이 될것으로 예측됩니다.

1. SuspenseWrapper가 실행되며 children도 normalizeVNode에 전달
2. children 중 AsyncUser 실행 → Promise를 던짐
3. normalizeVNode 안에서 Promise가 throw됨
4. SuspenseWrapper가 이를 try-catch로 잡아서 fallback을 반환
5. fallback만으로 vNode 트리를 구성해서 일단 렌더링
6. resolve 후 cache 갱신 + 리렌더링 트리깅
7. 다시 normalizeVNode 트리거 → 이번엔 cache hit → 실제 VNode로 교체 렌더링

## 느낀점

SPA에서의 렌더링은 동기적으로 일어나는것으로 보이지만, 많은 비동기 작업이 존재할수도있습니다. 실제로 즉시 평가가 불가능한(지연평가가 필요한 상황) 상황에서는 기존의 동기적인 렌더링 루틴에 비동기 처리가 자연스럽게 전이될수있는 설계가 필요하다고 생각합니다.