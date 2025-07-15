# renderElement 함수 정리

## 1. renderElement란?

renderElement 함수는 가상 DOM(vNode) 또는 JSX로 표현된 UI를 실제 브라우저의 DOM 컨테이너에 렌더링하는 역할을 합니다. createElement, eventManager 등과 연동하여, 선언적 UI를 실제로 그려주는 최종 진입점입니다.

---

## 2. 왜 필요한가?

- 가상 DOM 객체만으로는 브라우저에 실제 UI가 보이지 않습니다.
- renderElement는 vNode를 실제 DOM 요소로 변환(createElement)하고, 지정한 컨테이너에 삽입합니다.
- 이벤트 위임(setupEventListeners)도 함께 처리하여, 동적 UI와 상호작용이 자연스럽게 동작하도록 만듭니다.

---

## 3. 주요 동작 원리 및 코드별 설명

### 1) 입력값

- vNode: JSX 또는 createVNode/normalizeVNode로 생성된 가상 DOM 객체
- container: 실제 DOM 요소(렌더링 대상)

### 2) 렌더링 과정

- vNode를 normalizeVNode로 정규화하여, 컴포넌트/조건부 렌더링 등 다양한 입력을 일관된 구조로 만듭니다.
- createElement로 vNode를 실제 DOM 요소로 변환합니다.
- container의 기존 내용을 비우고, 새로 생성한 DOM 요소를 append합니다.
- setupEventListeners로 이벤트 위임을 한 번만 등록합니다.

### 3) 이벤트 및 동적 UI 처리

- 이벤트 핸들러는 addEvent로 등록되어 있으므로, setupEventListeners가 한 번만 실행되면 동적으로 추가/제거되는 요소에도 이벤트가 정상 동작합니다.

---

## 4. 결론

renderElement는 선언적 UI를 실제 브라우저에 그려주는 핵심 함수입니다. vNode 정규화, DOM 변환, 이벤트 위임까지 한 번에 처리하여, 효율적이고 일관된 렌더링을 보장합니다.
