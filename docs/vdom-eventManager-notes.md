# [Virtual DOM] eventManager 구현 학습 노트

## 필요성

가상 DOM 기반 라이브러리는 렌더링 과정에서 **수백~수천 개**의 엘리먼트를 생성·파기한다. 모든 노드에 직접 이벤트 핸들러를 바인딩하면

1. 메모리 사용 증가 (핸들러 복사)
2. 바인딩/언바인딩 비용 증가
3. 동적 노드(리스트 추가 등)에서 **새로 바인딩** 필수

→ **이벤트 위임(Event Delegation)** 으로 해결한다. 하나의 루트 요소에 이벤트를 위임해 **단일 핸들러**가 버블링을 이용해 이벤트를 처리한다.

## 1. 배운 것

- `Map<Element, Map<eventType, Set<handler>>>` 로 3-단계 구조를 만들어, 엘리먼트/타입별 다중 핸들러를 지원.
- `WeakMap` 을 이용해 루트(`setupEventListeners(root)`) 당 이미 등록한 이벤트 타입을 추적 → **중복 리스너 방지**.
- 브라우저 이벤트 버블링을 활용해 target→root 로 노드를 타고 올라가며 핸들러 호출.

## 2. 요구 사항 다시보기

```
addEvent(element, "click", handler)
setupEventListeners(root)
removeEvent(element, "click", handler)
```

1. 핸들러가 정상적으로 호출돼야 한다. (Vitest에서 spy 사용)
2. 같은 엘리먼트에 직접 `addEventListener` 한 핸들러가 있어도 위임 핸들러는 **중첩 호출**되지 않아야 한다.
3. `removeEvent` 호출 후엔 더 이상 실행되지 않아야 한다.

## 3. 구현 포인트 & 삽질 기록

1. **데이터 구조 선택**
   - `Map` + `Set` 조합으로 O(1) 로 조회/삭제.
2. **root 당 한 번만 바인딩**
   - 루트별 `WeakMap<Root, Set<type>>` 보유 → 이미 등록된 타입은 skip.
3. **Delegated Handler 구현**
   - 이벤트 버블링 중 모든 경로를 탐색. 매 노드마다 handler set 이 있으면 실행.
   - `handlers` 를 배열 snapshot 으로 복사 `[...handlers]` 후 반복 → 핸들러 내부에서 remove 호출해도 안전.
4. **메모리 정리**
   - `removeEvent` 호출 시 Set/Map 사이즈가 0 이면 상위 Map 제거해 leak 방지.
