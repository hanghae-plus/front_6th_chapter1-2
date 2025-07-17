# 📚 문서 가이드

이 프로젝트의 코드에서 상세한 주석과 설명을 별도 문서로 분리하여 정리했습니다.

## 🎯 핵심 Virtual DOM 시스템

### 📖 완전 가이드

- **[Virtual DOM 시스템 완전 가이드](./virtual-dom-system-guide.md)** - 전체 시스템 개요 및 플로우

### 🔧 개별 모듈 가이드

- **[createVNode 가이드](./createVNode-guide.md)** - JSX → Virtual DOM 객체 변환
- **[normalizeVNode 가이드](./normalizeVNode-guide.md)** - 컴포넌트 실행 및 정규화
- **[createElement 가이드](./createElement-guide.md)** - Virtual DOM → 실제 DOM 변환
- **[eventManager 가이드](./eventManager-guide.md)** - 이벤트 위임 시스템

## 📝 코드 vs 문서 분리의 장점

### ✅ 코드 파일

- 핵심 로직에 집중
- 가독성 향상
- 실제 구현에 필요한 정보만 포함

### ✅ 문서 파일

- 상세한 개념 설명
- 학습 자료로 활용
- 예제와 사용법 포함
- 팀원 온보딩에 유용

## 🎓 학습 순서 추천

1. **[Virtual DOM 시스템 완전 가이드](./virtual-dom-system-guide.md)** - 전체 개념 이해
2. **[createVNode 가이드](./createVNode-guide.md)** - 1단계: JSX 변환
3. **[normalizeVNode 가이드](./normalizeVNode-guide.md)** - 2단계: 컴포넌트 처리
4. **[createElement 가이드](./createElement-guide.md)** - 3단계: DOM 생성
5. **[eventManager 가이드](./eventManager-guide.md)** - 이벤트 시스템

## 💡 활용 방법

### 개발 시

```javascript
// 코드 파일에서 구현 확인
import { createVNode } from "./lib/createVNode.js";

// 자세한 설명이 필요하면 문서 확인
// → docs/createVNode-guide.md 참조
```

### 학습 시

1. 문서에서 개념 학습
2. 코드에서 실제 구현 확인
3. 예제로 실습
4. 테스트로 검증

### 팀 협업 시

- 새로운 팀원: 문서로 학습
- 코드 리뷰: 코드에 집중
- 기능 설명: 문서 공유
