# createVNode가 2번 호출되는 이유

## 🤔 왜 2번 호출될까?

### 원인 1: 중첩된 createVNode 호출

만약 이런 코드를 실행했다면:

```javascript
createVNode("div", null, createVNode("span", null, "Hello"), createVNode("b", null, "world"));
```

실행 순서:

1. **첫 번째 호출**: `createVNode("span", null, "Hello")`
2. **두 번째 호출**: `createVNode("b", null, "world")`
3. **세 번째 호출**: `createVNode("div", null, span결과, b결과)`

즉, 안쪽 createVNode들이 먼저 실행되고, 그 결과를 바깥쪽 createVNode가 받아서 실행됩니다.

### 원인 2: JSX 변환으로 인한 중첩

JSX에서:

```jsx
<div>
  <span>Hello</span>
</div>
```

이것이 다음과 같이 변환됩니다:

```javascript
createVNode("div", null, createVNode("span", null, "Hello"));
```

### 원인 3: React의 StrictMode나 개발 모드

만약 React 환경에서 실행한다면, 개발 모드에서는 의도적으로 함수를 2번 호출해서 순수함수인지 확인합니다.

### 원인 4: 테스트 환경에서의 중복 실행

테스트가 여러 번 실행되거나, 같은 코드가 여러 곳에서 호출될 때도 발생할 수 있습니다.

## 🔍 정확한 원인 찾기

어떤 코드를 실행했는지 확인해보세요:

### 1. 단순한 호출이었다면

```javascript
createVNode("div", { id: "test" }, "Hello");
```

이 경우 1번만 호출되어야 합니다.

### 2. 중첩된 호출이었다면

```javascript
createVNode("div", null, createVNode("span", null, "Hello"));
```

이 경우 2번 호출됩니다:

- 1번째: `createVNode("span", null, "Hello")`
- 2번째: `createVNode("div", null, span결과)`

### 3. 테스트에서 호출했다면

```javascript
// 테스트 파일에서
it("test 1", () => {
  createVNode("div", null, "Hello"); // 1번째 호출
});

it("test 2", () => {
  createVNode("span", null, "World"); // 2번째 호출
});
```

## 💡 호출 추적하는 방법

console.log에 스택 추적을 추가해보세요:

```javascript
export function createVNode(type, props, ...children) {
  console.log("🎯 createVNode 호출됨:", { type, props, children });
  console.log("📍 호출 스택:", new Error().stack);

  // ...기존 코드...
}
```

이렇게 하면 어디서 호출되었는지 정확히 알 수 있습니다.

## 🧪 테스트로 확인

어떤 테스트를 실행했는지 알려주시면 정확한 원인을 찾을 수 있어요!

예를 들어:

- `npm test createVNode` 실행했나요?
- 특정 JSX 코드를 작성했나요?
- 브라우저에서 직접 테스트했나요?
