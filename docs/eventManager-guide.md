# eventManager.js 완전 가이드

## 🎯 개요

`eventManager.js`는 효율적인 이벤트 관리를 위한 이벤트 위임(Event Delegation) 시스템을 구현한 모듈입니다.

## 🤔 왜 이벤트 위임이 필요한가?

### 💸 일반적인 방식의 문제점

- 각 요소마다 개별 이벤트 리스너 등록 → **메모리 낭비**
- 1000개 버튼 = 1000개 이벤트 리스너 → **성능 저하**
- 동적으로 추가되는 요소는 별도 이벤트 등록 필요

### ✨ 이벤트 위임의 해결책

- 부모 요소(root)에 **하나의 이벤트 리스너만 등록**
- 이벤트 버블링을 활용해서 자식 요소의 이벤트를 부모에서 처리
- **메모리 효율적**, 동적 요소도 자동으로 처리됨

## 🌊 이벤트 버블링 이해

```html
<div>(부모) <button>(자식) ← 클릭!</button></div>
```

**이벤트 흐름**: `button` → `div` → `document`

부모에서 자식의 이벤트를 "가로채서" 처리 가능!

## 🗂️ 핵심 개념

### WeakMap 사용

```javascript
const eventMap = new WeakMap();
```

**WeakMap을 사용하는 이유**:

- DOM 요소가 삭제되면 자동으로 메모리에서 정리됨
- **메모리 누수 방지**

## 📋 주요 함수들

### setupEventListeners(root)

루트 요소에 이벤트 위임 리스너를 설정하는 함수

```javascript
// 사용 예시
const root = document.getElementById("root");
setupEventListeners(root);
// 이제 root 아래의 모든 요소의 이벤트가 root에서 처리됨
```

**구현할 내용**:

1. root에 각 이벤트 타입별로 리스너 등록 (click, input, change 등)
2. 이벤트 발생 시 `event.target`으로 실제 클릭된 요소 찾기
3. 해당 요소에 등록된 핸들러가 있으면 실행

### addEvent(element, eventType, handler)

특정 요소에 이벤트 핸들러를 등록하는 함수

```javascript
// 사용 예시
const button = document.querySelector("button");
addEvent(button, "click", () => {
  console.log("버튼 클릭!");
});
// 실제로는 button에 직접 리스너를 추가하지 않고, eventMap에만 저장
```

**매개변수**:

- `element`: 이벤트를 등록할 요소
- `eventType`: 이벤트 타입 (click, input, change 등)
- `handler`: 이벤트 발생 시 실행할 함수

**구현할 내용**:

1. eventMap에서 element에 해당하는 이벤트 맵 가져오기
2. 없으면 새로 생성
3. eventType별로 핸들러 배열에 추가
4. 중복 등록 방지 로직

### removeEvent(element, eventType, handler)

특정 요소의 이벤트 핸들러를 제거하는 함수

```javascript
// 사용 예시
const button = document.querySelector("button");
const clickHandler = () => console.log("클릭!");

addEvent(button, "click", clickHandler); // 등록
removeEvent(button, "click", clickHandler); // 제거
```

**역할**: 메모리 누수 방지를 위해 eventMap에서 해당 핸들러를 찾아서 제거

**구현할 내용**:

1. eventMap에서 element에 해당하는 이벤트 맵 가져오기
2. eventType 배열에서 특정 handler 찾아서 제거
3. 배열이 비면 eventType 자체도 삭제
4. 모든 이벤트가 없으면 element도 eventMap에서 삭제

## 🔄 이벤트 위임 흐름

1. **초기화**: `setupEventListeners(root)`로 루트에 리스너 등록
2. **핸들러 등록**: `addEvent()`로 요소별 핸들러를 eventMap에 저장
3. **이벤트 발생**: 자식 요소에서 이벤트 발생
4. **버블링**: 이벤트가 부모로 전파
5. **처리**: 루트의 리스너가 실제 타겟을 찾아 해당 핸들러 실행

## 💡 장점

### 성능 최적화

- 메모리 사용량 대폭 감소
- 이벤트 리스너 개수 최소화

### 동적 요소 지원

- 새로 추가되는 요소도 자동으로 이벤트 처리
- 별도의 이벤트 재등록 불필요

### 메모리 누수 방지

- WeakMap 사용으로 자동 가비지 컬렉션
- 명시적인 `removeEvent` 호출로 정리 가능

## ⚠️ 주의사항

1. **이벤트 버블링**: 모든 이벤트가 버블링되는 것은 아님 (focus, blur 등 제외)
2. **성능 고려**: 너무 많은 핸들러가 등록되면 lookup 성능 저하
3. **메모리 관리**: 더 이상 사용하지 않는 핸들러는 명시적으로 제거

## 🔗 관련 파일

- `createElement.js`: 이벤트 핸들러 등록 시 사용
- Virtual DOM 컴포넌트들: onClick 등의 props가 이 시스템을 통해 처리
