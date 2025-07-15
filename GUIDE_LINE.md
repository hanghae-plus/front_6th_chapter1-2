# React VDom 프로젝트 이해 가이드

## 프로젝트 개요

이 프로젝트는 React의 가상 DOM(Virtual DOM) 시스템을 이해하기 위한 학습 프로젝트입니다.
기본적인 가상 DOM 구현을 통해 React의 내부 동작 원리를 파악하는 것이 목표입니다.

## 핵심 개념들

### 1. 가상 DOM (Virtual DOM)

- 실제 DOM을 메모리에서 JavaScript 객체로 표현한 것
- 성능 최적화를 위해 실제 DOM 조작을 최소화하는 기술
- 구조: `{ type, props, children }`

### 2. JSX와 createVNode

- JSX는 `/** @jsx createVNode */` 주석을 통해 `createVNode` 함수 호출로 변환됨
- `<div>Hello</div>` → `createVNode('div', null, 'Hello')`

## 구현해야 할 함수들

### 1. createVNode(type, props, ...children)

**목적**: JSX를 가상 DOM 객체로 변환
**구조**:

```javascript
{
  type: 'div' | Component,
  props: { id: 'test' } | null,
  children: ['Hello', ...] // 평탄화된 배열
}
```

**핵심 요구사항**:

- 자식 요소들을 평탄화(flatten) 처리
- null/undefined 속성 처리
- 함수형 컴포넌트와 일반 요소 구분

### 2. normalizeVNode(vNode)

**목적**: 가상 DOM을 실제 렌더링 가능한 형태로 정규화
**처리 사항**:

- `null`, `undefined`, `boolean` → 빈 문자열
- 숫자 → 문자열 변환
- 함수형 컴포넌트를 실제 DOM 구조로 변환
- falsy 값들을 자식 노드에서 제거

### 3. createElement(vNode)

**목적**: 정규화된 가상 DOM을 실제 DOM 요소로 변환
**처리 사항**:

- 텍스트 노드 생성
- HTML 요소 생성 및 속성 설정
- 자식 요소 재귀적 생성
- 배열 입력 시 DocumentFragment 생성
- 데이터 속성, 불리언 속성 처리

### 4. Event 관리 시스템

**addEvent(element, eventType, handler)**: 이벤트 등록
**removeEvent(element, eventType, handler)**: 이벤트 제거
**setupEventListeners(container)**: 이벤트 위임 설정

**특징**:

- 이벤트 위임 방식 사용
- 컨테이너에서 이벤트를 캐치하여 실제 타겟으로 전달

### 5. renderElement(vNode, container)

**목적**: 가상 DOM을 실제 DOM으로 렌더링하고 이벤트 설정
**프로세스**:

1. 컴포넌트 정규화 (normalizeVNode)
2. DOM 요소 생성 (createElement)
3. 이벤트 리스너 설정 (setupEventListeners)
4. 컨테이너에 마운트

## 테스트 진행 순서

현재 `describe.only("createVNode")`로 createVNode 테스트만 실행 중입니다.

1. **createVNode 구현** (현재 단계)
2. **normalizeVNode 구현**
3. **createElement 구현**
4. **Event 관리 시스템 구현**
5. **renderElement 구현**

## 주요 학습 포인트

1. **JSX 트랜스폼**: JSX가 어떻게 함수 호출로 변환되는지
2. **가상 DOM 구조**: React의 내부 데이터 구조
3. **컴포넌트 정규화**: 함수형 컴포넌트가 어떻게 실제 DOM으로 변환되는지
4. **이벤트 위임**: 성능 최적화를 위한 이벤트 처리 방식
5. **재귀적 렌더링**: 중첩된 구조를 어떻게 처리하는지

## 현재 상태

- 테스트 파일에서 `createVNode` 함수부터 구현 시작
- 각 함수는 테스트를 통과하면서 단계적으로 구현 예정
