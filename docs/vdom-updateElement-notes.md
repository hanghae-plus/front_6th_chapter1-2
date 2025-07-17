# [Virtual DOM] updateElement(diff 알고리즘) 구현 학습 노트

## 필요성

`updateElement` 는 **VDOM → DOM 동기화**의 핵심이다. 초기 마운트 이후에는 전체를 다시 그리지 않고 _변경된 부분만_ 패치해야 성능을 확보할 수 있다.

- React 의 `react-dom` diff(legacy)·`Fiber` 에 해당.
- 불필요한 DOM 교체를 막아 기존 노드와 이벤트, 상태를 재사용한다.

## 1. 배운 것

1. **VNode 비교 전략**
   - _Textish_ vs _Element_ vs _null/undefined_.
   - **타입이 다르면** `replaceChild` 한 방.
   - **같은 타입**이면 속성 → 자식 순으로 재귀적 업데이트.
2. **속성 동기화 로직**
   - 삭제 → 추가/변경의 2-pass 로 단순화.
   - boolean 속성은 `el[prop] = bool` + `set/removeAttribute` 병행.
   - 이벤트 핸들러는 `onXxx` → `eventManager.add/removeEvent` 위임.
3. **자식 배열 diff**
   - 과제 스펙상 keyless, index 기반 비교로 충분.
   - `maxLen = Math.max(oldChildren.length, newChildren.length)` 루프에서
     - `new undefined` → 제거
     - `old undefined` → 추가
4. **GC 안전한 prevMap**
   - `renderElement` 에서는 `WeakMap<container, vnode>` 로 이전 트리를 저장 → 루트 DOM 제거 시 GC 가능.

## 2. 요구 사항 다시보기

```
function updateElement(parentEl, newVNode, oldVNode, index = 0): void
```

1. **추가**: `oldVNode` 가 없으면 `createElement(newVNode)` 생성 후 `insertBefore | appendChild`.
2. **삭제**: `newVNode` 가 없으면 `parentEl.removeChild(existing)`.
3. **텍스트 변경**: `textContent` 직접 교체.
4. **타입 변경**: `replaceChild`.
5. **동일 타입**:
   1. `updateAttributes` 로 props diff
   2. 자식 배열 재귀 diff

## 3. 삽질 & 트러블슈팅

- **Fragment vs Element**
  - `createElement` 가 배열을 `DocumentFragment` 로 변환 → 부모에 append 시 실제 자식이 복사되므로 diff 과정엔 Fragment가 거의 등장 X.
- **boolean Attribute serialisation**
  - `<input disabled>` 직렬화 시 `disabled=""` 로 확인해야 테스트 통과.
- **이벤트 메모리 누수**
  - 기존 핸들러를 삭제하지 않아 spy count 누락 ➜ `removeEvent` 호출 필수.
- **자식 제거 순서**
  - index 기반 접근이라 DOM API 가 역순으로 처리됨. 테스트는 *결과*만 검증하므로 안전.

## 4. 마치며

이번 구현은 **테스트 난이도**에 맞춘 O(N) index diff다. Keyed diff, Move 연산 최소화(Fiber) 같은 고급 기능은 Scope 밖이지만, 본질적인 _"바뀐 만큼만 바꾼다"_ 를 체험할 수 있었다. 다음 단계로는 key 기반 비교와 `requestIdleCallback` 를 활용한 비동기 패치에 도전해보자.
