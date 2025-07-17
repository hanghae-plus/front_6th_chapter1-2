# normalizeVNode 함수 구현 가이드

## 🎯 normalizeVNode의 역할

### 주요 기능

1. **Falsy 값 처리**: `null`, `undefined`, `boolean` → 빈 문자열
2. **타입 변환**: 숫자 → 문자열
3. **함수형 컴포넌트 실행**: 컴포넌트 함수 호출해서 결과 얻기
4. **children 정규화**: 배열의 falsy 값들 제거

## 🧪 테스트 요구사항

### 1. Falsy 값 변환

```javascript
normalizeVNode(null) → ""
normalizeVNode(undefined) → ""
normalizeVNode(true) → ""
normalizeVNode(false) → ""
```

### 2. 문자열/숫자 변환

```javascript
normalizeVNode("hello") → "hello"
normalizeVNode(123) → "123"
normalizeVNode(0) → "0"
```

### 3. 함수형 컴포넌트 처리

```javascript
const TestComponent = () => <div>Hello</div>;
normalizeVNode(<TestComponent />) → { type: "div", props: {}, children: "Hello" }
```

### 4. children에서 falsy 값 제거

```javascript
<div>
  유효한 값{null}{undefined}{false}{true}
  <span>자식 노드</span>
</div>
↓
<div>
  유효한 값<span>자식 노드</span>
</div>
```

## 📝 구현 전략

### 1단계: 기본 타입 처리

- null, undefined, boolean → ""
- 숫자 → 문자열

### 2단계: 함수형 컴포넌트 처리

- vNode.type이 함수인지 확인
- 함수 실행해서 결과 얻기
- 재귀적으로 normalizeVNode 호출

### 3단계: 일반 vNode 처리

- children 배열에서 falsy 값 제거
- 각 child를 재귀적으로 정규화
