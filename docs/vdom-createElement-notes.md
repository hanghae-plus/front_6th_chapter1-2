# [Virtual DOM] createElement 구현 학습 노트

## 필요성

`normalizeVNode` 로 정제된 vNode 트리를 **실제 DOM 노드**로 변환하는 단계.

- diff-patch 사이클에서 _patch_ 단계(`updateElement`)가 새로 만든 노드가 필요할 때 `createElement` 를 호출한다.
- 브라우저 API(`document.createElement`, `createTextNode`, `DocumentFragment`)를 한 곳에서만 사용하도록 캡슐화해, 렌더러 교체(예: React-DOM ↔ React-Native) 시 의존성을 최소화한다.
- 이벤트 위임(`eventManager`)과 속성 업데이트 로직을 결합하여 **단일 진입점** 형태로 유지한다.

## 1. 배운 것

- 원시값 → 텍스트 노드 변환 규칙
- 배열 → `DocumentFragment` 로 batch append (reflow 최소화)
- 이벤트 핸들러를 DOM 노드에 직접 붙이지 않고 **위임 큐**에 등록
- boolean, data-\* 속성 처리 등 attribute edge-case

## 2. 요구 사항 다시보기

```
function createElement(vNode) => Node | DocumentFragment
```

1. `null | undefined | boolean` → 빈 텍스트 노드
2. string / number → 텍스트 노드
3. 배열 → `DocumentFragment` (자식 반복 append)
4. 함수형 컴포넌트 전달 시 오류 throw (normalize 이후 사용해야 함)
5. vNode 객체 → `HTMLElement`
   - props 처리
     - className → class 속성
     - boolean 사례 (disabled 등)
     - data-\* 보존
     - onClick 등 이벤트: `addEvent` 위임 등록

## 3. 구현 포인트 & 삽질 기록

1. **Textish 판정 헬퍼**
   ```js
   const isTextish = (v) => ["string", "number", "boolean"].includes(typeof v) || v == null;
   ```
2. **DocumentFragment 의 장점**
   - 배열 자식 노드를 하나씩 append 하면 reflow 2N 회 발생 → Fragment 로 1회.
3. **className vs class**
   - JSX는 `className`, DOM은 `class`. attribute 변환 필요.
4. **boolean 속성**
   - `disabled={true}` 면 `$el.disabled = true; $el.setAttribute('disabled', '')` 로 처리해야 테스트 통과.
5. **이벤트 위임**
   - `onclick` 직접 바인딩은 불필요한 메모리 낭비 → `addEvent($el, 'click', handler)` 로 루트에 등록.
6. **함수형 컴포넌트 에러**
   - normalizeVNode 단계를 건너뛰면 테스트에서 의도적으로 오류를 검증하므로 throw 구현.
