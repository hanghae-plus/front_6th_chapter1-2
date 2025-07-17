# 🌟 Virtual DOM 시스템 학습 노트

## 📚 전체 흐름 이해

### 1단계: createVNode.js

- **역할**: JSX → Virtual DOM 객체 변환
- **핵심 개념**:
  - JSX는 문법 설탕일 뿐, 실제로는 함수 호출로 변환됨
  - Babel이 `<div>Hello</div>` → `createVNode("div", null, "Hello")` 로 변환
  - 배열 평탄화가 중요한 이유: `{items.map()}` 때문에 중첩 배열 발생

### 2단계: normalizeVNode.js

- **역할**: 컴포넌트 실행 + 정규화
- **핵심 개념**:
  - 함수형 컴포넌트를 실행해서 실제 JSX 구조로 변환
  - falsy 값들 필터링 (null, undefined, false 등)
  - 재귀적으로 모든 중첩 구조 처리

### 3단계: createElement.js

- **역할**: Virtual DOM → 실제 DOM 변환
- **핵심 개념**:
  - `document.createElement()`로 실제 DOM 요소 생성
  - 속성 설정 (id, class, 이벤트 핸들러)
  - 자식 요소들을 재귀적으로 처리해서 DOM 트리 완성

### 4단계: eventManager.js

- **역할**: 이벤트 위임 시스템
- **핵심 개념**:
  - 모든 이벤트를 부모 요소에서 처리 (성능 최적화)
  - 이벤트 버블링 활용
  - 메모리 효율적, 동적 요소 자동 처리

## 🤔 왜 이런 복잡한 과정이 필요한가?

1. **성능**: Virtual DOM은 메모리에서 빠르게 조작 가능
2. **일관성**: 모든 UI 변경이 동일한 흐름으로 처리
3. **예측 가능성**: 상태 → UI 변환이 명확함
4. **최적화**: 실제 DOM 조작을 최소화

## 💡 핵심 개념들

### Virtual DOM vs Real DOM

- **Virtual DOM**: JavaScript 객체 (빠름, 메모리)
- **Real DOM**: 브라우저 DOM API (느림, 화면)

### 이벤트 위임이란?

```
일반적인 방식: 버튼 1000개 = 이벤트 리스너 1000개
이벤트 위임: 부모 1개에만 리스너, 버블링으로 처리
```

### 배열 평탄화가 중요한 이유

```jsx
// 이런 코드가 중첩 배열을 만듦
<div>
  {items.map((item) => (
    <span>{item}</span>
  ))}
</div>

// children: ["안녕", [span1, span2, span3]]
// flat()으로: ["안녕", span1, span2, span3]
```

---

_이 파일은 개인 학습용이므로 Git에 커밋하지 않습니다._
