# 흰 화면 문제 분석

## 🚨 현재 상황

### createVNode는 동작하지만...

- ✅ `createVNode`: Virtual DOM 객체 생성 완료
- ❌ `normalizeVNode`: 컴포넌트 정규화 미구현
- ❌ `createElement`: vNode → 실제 DOM 변환 미구현
- ❌ `renderElement`: 전체 렌더링 프로세스 미구현

### 현재 렌더링 플로우

```javascript
// render.jsx에서
renderElement(<PageComponent />, rootElement);
```

하지만 `renderElement`가 빈 함수라서 아무것도 화면에 그려지지 않음!

## 🎯 다음 구현 순서

1. **normalizeVNode** - 컴포넌트를 일반 vNode로 변환
2. **createElement** - vNode를 실제 DOM 요소로 변환
3. **renderElement** - 전체 렌더링 프로세스 관리

이 3개를 구현하면 화면에 내용이 나타날 것입니다!

## 💡 핵심 개념

**createVNode**는 단순히 데이터 구조만 만드는 함수입니다:

```javascript
// createVNode 결과 (JavaScript 객체)
{
  type: "h1",
  props: { className: "title" },
  children: "Hello"
}
```

이것을 실제 HTML로 만들려면:

```html
<!-- createElement가 만들어야 할 실제 DOM -->
<h1 class="title">Hello</h1>
```

**renderElement**가 이 DOM을 화면의 `#root`에 넣어주는 역할을 합니다.
