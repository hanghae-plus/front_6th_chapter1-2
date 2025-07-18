# Asynchronous 컴포넌트는 어떻게 처리해야 할까?

현재 `normalizeVNode`에서 함수 컴포넌트를 처리할 때 아래와 같은 코드로 동작합니다:

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
    const result = vNode.type(props); // 🚨 Promise를 반환하는 경우 문제 발생
    return normalizeVNode(result);
}

async function AsynchronousComponent({ userId }) {
    const user = await findUserData(userId);

    return <div>Hello {user.name}!</div>;
}
```

> `vNode.type(props)`가 Promise를 반환하는 경우 `normalizeVNode(result)`는 아직 resolve되지 않은 상태의 값을 재귀 호출하게 됩니다. 이로 인해 정상적인 vNode 트리가 생성되지 않거나, 렌더링 중 오류가 발생할 수 있습니다.

즉, `result`가 **Promise**인지 확인조차 하지 않고 동기적으로 처리하기 때문에 다음과 같은 문제가 발생합니다:

```js
const result = vNode.type(props); // 🚨 async 컴포넌트인 경우 Promise 반환
return normalizeVNode(result);   // ❌ 이 시점엔 아직 결과값이 없음
```

---

## 🚨 왜 문제인가?

JSX는 기본적으로 **함수 컴포넌트가 동기적으로(vNode를 즉시 반환)** 렌더링된다는 전제를 기반으로 동작합니다. 그러나 컴포넌트가 `async function`이 되어 `Promise`를 반환하게 되면 이 전제가 무너집니다.

이처럼 비동기 vNode는 평가 시 `Promise`를 반환할 수 있으므로, **부모 컴포넌트가 Suspense인지 아닌지에 따라 처리 방식이 달라져야** 합니다.

* ✅ **부모가 `<Suspense>` 컴포넌트일 경우:**

  * 현재 vNode가 Promise를 반환하면 이를 `throw`하여 Suspense fallback UI를 렌더링하도록 합니다.
  * 이후 Promise가 resolve되면 정상적인 렌더 트리로 복귀합니다.
  * 이는 React의 Suspense 메커니즘과 동일합니다.

* ❌ **부모가 `<Suspense>`가 아닐 경우:**

  * Promise가 완료될 때까지 `await`하여 기다린 뒤 계속 렌더링을 진행해야 합니다.
  * 이 방식은 전체 트리 렌더링을 블로킹하므로, **최후의 수단**으로 고려되어야 합니다.

---

## `normalizeVNode` 수정

비동기 컴포넌트를 처리하기 위해서는 `normalizeVNode` 자체도 `async function`이 되어야 하며, 내부 평가 흐름에서도 `Promise` 여부를 감지하고 적절히 처리해야 합니다.

```js
class ThenableError extends Error {}

async function normalizeVNode(vNode) {
  if (typeof vNode.type === "function") {
    const props = { ...vNode.props };
    if (vNode.children?.length > 0) {
      props.children = await Promise.all(
        vNode.children.map((child) => normalizeVNode(child))
      );
    }

    try {
      const result = vNode.type(props);

      if (isThenable(result)) {
        if (isInsideSuspenseContext()) {
          throw result; // Suspense fallback으로 전환
        } else {
          const awaited = await result;
          return await normalizeVNode(awaited); // 직렬 렌더링
        }
      }

      return await normalizeVNode(result);
    } catch (error) {
      if (error instanceof ThenableError) {
        return createVNode(vNode.fallback);
      }
      throw error;
    }
  }

  // ...
}
```

---

## ⛓️ Asynchronous 컴포넌트와 fallback UI

비동기 컴포넌트는 기존 렌더링 루틴(`normalizeVNode`)에서 직접 처리되기 어렵기 때문에 아래와 같은 설계가 필요합니다:

### 1. 렌더링 타이밍 제어

* `async function Component()`는 즉시 vNode를 반환하지 않습니다.
* 결과가 도착할 때까지 fallback UI를 먼저 렌더링해야 합니다.

### 2. 예외 기반 흐름 제어

* React의 Suspense처럼 `throw Promise`를 통해 흐름을 탈출시킵니다.
* 외부 `SuspenseWrapper`가 이를 `try/catch`로 잡아 fallback UI를 렌더링합니다.

---

## Suspense 패턴 사용

```js
function SuspenseWrapper({ children, fallback, ...props }) {
  return createVNode(fallback, props, children);
}
```

```js
function createAsyncComponent(asyncFn) {
  const cache = new Map();

  return function AsyncWrapper(props) {
    const cacheKey = JSON.stringify(props);

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (cached instanceof Promise) {
        throw cached; // Suspense가 캐치
      }
      return cached;
    }

    const promise = asyncFn(props).then((result) => {
      cache.set(cacheKey, result);
      triggerRerender(); // 리렌더링 트리거
      return result;
    });

    cache.set(cacheKey, promise);
    throw promise; // Suspense가 캐치
  };
}
```

`createAsyncComponent`는 클로저 내부에 `cache`를 유지합니다. 이는 **컴포넌트마다 별도 캐시**를 만들기 위함입니다. 전역 캐시를 쓸 경우, 동일 컴포넌트를 여러 번 호출할 때 상태가 섞일 수 있기 때문입니다.

---

## 결론

비동기 컴포넌트는 `Promise`를 반환하므로 기존 vNode 렌더링 루틴에 직접 넣게 되면 트리가 깨질 수 있습니다. Suspense 패턴을 통해 fallback → resolvedVNode로 자연스럽게 전이될 수 있도록 설계해야 합니다.

---

### AS-IS (Promise를 고려하지 않은 vNode 트리 흐름)

```jsx
<App>
  <AsyncComponent />
</App>
```

```js
{
  type: App,
  props: {},
  children: [{ type: AsyncComponent }] // 🚨 Promise 반환
}
```

```js
const result = vNode.type(props); // 🚨 async
return normalizeVNode(result);    // ❌ 아직 결과 없음
```

---

### TO-BE (Promise를 고려한 vNode 트리 흐름)

```jsx
<App>
  <SuspenseWrapper fallback={<div>Loading...</div>}>
    <AsyncComponent />
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
        children: [{ type: AsyncComponent }]
      }
    }
  ]
}
```

### 예상 흐름

1. `normalizeVNode(SuspenseWrapper)`가 호출됨
2. `children` 중 `AsyncComponent` 실행 → `Promise` 반환
3. `normalizeVNode`에서 `throw Promise`
4. `SuspenseWrapper`가 이를 `try/catch`로 감지 → `fallback` 렌더링
5. `fallback` 기반으로 vNode 트리를 일단 구성
6. 이후 Promise가 resolve되면 cache 갱신 및 리렌더링
7. 다시 `normalizeVNode` 실행 → 이번엔 cache hit → 실제 vNode로 대체 렌더링

---

## 💭 느낀 점

SPA의 렌더링은 동기적으로 보이지만, 실제로는 많은 비동기 작업이 함께 존재합니다. 즉시 평가가 불가능한 경우, 기존의 동기 렌더링 루틴이 자연스럽게 비동기 흐름으로 전이될 수 있도록 **명확한 설계 원칙과 흐름 제어 체계가 필요하다**고 느꼈습니다.