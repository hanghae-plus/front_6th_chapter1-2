# 학습 진행 상황

## ✅ 완료된 내용

### 1. Virtual DOM 기초 개념 이해
- [x] Virtual DOM이 무엇인지, 왜 필요한지
- [x] 일반 DOM 조작의 문제점
- [x] Virtual DOM의 해결책
- [x] Virtual DOM 시스템의 전체 구성 요소

### 2. createVNode 함수 완전 분석
- [x] 함수의 역할과 목적
- [x] JSX → 함수 호출 변환 과정
- [x] 테스트 요구사항 분석
- [x] 현재 구현 코드 한 줄씩 분석
- [x] 배열 평탄화가 왜 필요한지
- [x] props 처리 방식
- [x] children 개수별 처리 로직

## 🔄 다음 학습 단계

### 순서 (의존성 기반)
1. **eventManager** - 독립적이고 이해하기 쉬운 함수들
2. **normalizeVNode** - 컴포넌트를 일반 vNode로 변환
3. **createElement** - vNode를 실제 DOM으로 변환
4. **updateElement** - Diff 알고리즘으로 효율적 업데이트
5. **renderElement** - 전체를 조합하는 함수

### 다음 함수: eventManager
**배울 내용:**
- 이벤트 위임(Event Delegation) 개념
- WeakMap을 사용한 메모리 효율적 이벤트 저장
- setupEventListeners, addEvent, removeEvent 함수들

## 📚 학습 파일 구조
```
learning-notes/
├── 01-virtual-dom-basics.md     ✅ 완료
├── 02-createVNode-analysis.md   ✅ 완료
├── 03-event-manager.md          🔄 다음
├── 04-normalize-vnode.md        ⏳ 대기
├── 05-create-element.md         ⏳ 대기
├── 06-update-element.md         ⏳ 대기
└── 07-render-element.md         ⏳ 대기
```

## 💡 중요한 깨달음

1. **createVNode의 핵심**: JSX 문법 설탕을 실제 데이터 구조로 변환
2. **배열 평탄화의 필요성**: 중첩된 배열 구조를 단순화하여 일관성 유지
3. **타입 안정성**: props가 null일 때 빈 객체로 처리하여 런타임 에러 방지
4. **일관된 children 처리**: 단일 자식은 값 자체로, 복수 자식은 배열로 처리
