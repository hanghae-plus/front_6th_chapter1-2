# Virtual DOM 시스템 완전 가이드

## 🌟 개요

이 프로젝트는 React와 유사한 Virtual DOM 시스템을 구현합니다. JSX 문법부터 실제 DOM 조작까지의 전체 과정을 학습할 수 있습니다.

## 🔄 Virtual DOM 처리 단계

### 1단계: createVNode.js

**JSX → Virtual DOM 객체 변환**

```javascript
// JSX
<div id="test">Hello</div>

// ↓ Babel 변환

// createVNode 호출
createVNode("div", { id: "test" }, "Hello")

// ↓ 결과

// Virtual DOM 객체
{ type: "div", props: { id: "test" }, children: ["Hello"] }
```

**주요 기능:**

- 배열 평탄화 (map으로 생성된 중첩 배열 처리)
- props 정규화 (undefined → {}, null 유지)

### 2단계: normalizeVNode.js

**컴포넌트 함수 실행 및 값 정규화**

```javascript
// 컴포넌트 함수
function Button({ text }) {
  return <button>{text}</button>;
}

// ↓ normalizeVNode 처리

// 함수 실행
Button({ text: "클릭" })

// ↓ 결과

// HTML 요소로 변환
{ type: "button", props: {}, children: ["클릭"] }
```

**주요 기능:**

- 함수형 컴포넌트 실행
- falsy 값 제거 (null, undefined, false → "")
- 재귀적 정규화

### 3단계: createElement.js

**Virtual DOM → 실제 DOM 변환**

```javascript
// Virtual DOM
{ type: "div", props: { id: "test" }, children: ["Hello"] }

// ↓ createElement 처리

// 실제 DOM 생성
const div = document.createElement("div");
div.setAttribute("id", "test");
div.appendChild(document.createTextNode("Hello"));

// ↓ 결과

// <div id="test">Hello</div>
```

**주요 기능:**

- HTML 요소 생성
- 속성 설정 (이벤트 핸들러, className, 불리언 속성 등)
- 자식 요소 재귀적 추가

## 🎯 지원 시스템들

### eventManager.js - 이벤트 위임

**하나의 루트 요소에서 모든 이벤트 관리**

```javascript
// 기존 방식 (비효율적)
button1.addEventListener("click", handler1);
button2.addEventListener("click", handler2);
// ... 1000개 버튼 = 1000개 리스너

// 이벤트 위임 (효율적)
root.addEventListener("click", (e) => {
  // event.target으로 실제 클릭된 요소 찾기
  // 해당 요소의 핸들러 실행
});
// 1개 리스너로 모든 이벤트 처리
```

### createStore.js - 상태 관리

**Redux 스타일의 상태 관리**

```javascript
const store = createStore(reducer, initialState);

// 상태 조회
const state = store.getState();

// 액션 디스패치
store.dispatch({ type: "INCREMENT" });

// 구독
store.subscribe(() => {
  // 상태 변경 시 실행
});
```

### Router.js - SPA 라우팅

**Single Page Application 라우팅**

```javascript
const router = new Router();

// 라우트 등록
router.addRoute("/product/:id", ProductPage);

// 네비게이션
router.push("/product/123");

// 파라미터 접근
const { id } = router.params; // "123"
```

## 📊 전체 플로우

```
1. 개발자가 JSX 작성
   ↓
2. Babel이 createVNode 호출로 변환
   ↓
3. createVNode가 Virtual DOM 객체 생성
   ↓
4. normalizeVNode가 컴포넌트 함수 실행 및 정규화
   ↓
5. createElement가 실제 DOM 요소 생성
   ↓
6. renderElement가 DOM에 렌더링
   ↓
7. eventManager가 이벤트 처리
```

## 💡 핵심 개념

### Virtual DOM의 장점

1. **성능 최적화**: 메모리에서 빠른 조작
2. **배치 업데이트**: 여러 변경사항을 한 번에 처리
3. **크로스 브라우저**: 브라우저 호환성 문제 해결

### 컴포넌트 기반 개발

1. **재사용성**: 컴포넌트를 여러 곳에서 재사용
2. **유지보수성**: 독립적인 컴포넌트로 관리
3. **테스트 용이성**: 단위별로 테스트 가능

### 이벤트 위임의 효과

1. **메모리 효율성**: 리스너 개수 최소화
2. **동적 요소 지원**: 새로 추가되는 요소도 자동 처리
3. **성능 향상**: 이벤트 처리 최적화

## 🔧 개발 팁

### JSX 작성 시 주의사항

```javascript
// ✅ 올바른 사용
<div className="container">
  {items.map(item => <span key={item.id}>{item.name}</span>)}
</div>

// ❌ 피해야 할 사용
<div class="container"> {/* className 사용 */}
  {items.map(item => <span>{item.name}</span>)} {/* key 누락 */}
</div>
```

### 컴포넌트 작성 규칙

```javascript
// ✅ 함수형 컴포넌트
function MyComponent({ props, children }) {
  return <div>{children}</div>;
}

// ✅ 조건부 렌더링
function ConditionalComponent({ show, children }) {
  return show ? <div>{children}</div> : null;
}
```

### 이벤트 핸들러 등록

```javascript
// ✅ 올바른 이벤트 핸들러
<button onClick={() => console.log('클릭!')}>
  클릭하세요
</button>

// ✅ 이벤트 객체 사용
<input onChange={(e) => setValue(e.target.value)} />
```

## 📚 관련 문서

- [createVNode 가이드](./createVNode-guide.md)
- [normalizeVNode 가이드](./normalizeVNode-guide.md)
- [createElement 가이드](./createElement-guide.md)
- [eventManager 가이드](./eventManager-guide.md)
