# JavaScript 내장 상수와 메서드 비교 분석

## 개요

JavaScript에서 배열 평탄화와 문자열 변환 시 사용되는 내장 상수와 메서드들의 차이점을 분석합니다. 특히 `Infinity` vs `Number.POSITIVE_INFINITY`, `String()` vs `toString()`의 선택 기준을 다룹니다.

## 1. Infinity vs Number.POSITIVE_INFINITY

### 1.1 기본 비교

```javascript
// 값 비교
console.log(Infinity === Number.POSITIVE_INFINITY); // true
console.log(Infinity === Number.NEGATIVE_INFINITY); // false
console.log(-Infinity === Number.NEGATIVE_INFINITY); // true

// 타입 비교
console.log(typeof Infinity); // "number"
console.log(typeof Number.POSITIVE_INFINITY); // "number"
```

### 1.2 성능 비교

```javascript
// 성능 테스트
const arr = [1, [2, [3, [4, 5]]]];

console.time('Infinity');
for (let i = 0; i < 1000000; i++) {
  arr.flat(Infinity);
}
console.timeEnd('Infinity');

console.time('Number.POSITIVE_INFINITY');
for (let i = 0; i < 1000000; i++) {
  arr.flat(Number.POSITIVE_INFINITY);
}
console.timeEnd('Number.POSITIVE_INFINITY');

// 결과: Infinity가 약간 더 빠름 (글로벌 상수)
```

### 1.3 가독성 비교

```javascript
// Infinity 사용
arr.flat(Infinity);

// Number.POSITIVE_INFINITY 사용
arr.flat(Number.POSITIVE_INFINITY);
```

### 1.4 권장사항

**✅ Infinity 사용 권장**

**이유:**
- 더 짧고 읽기 쉬움
- 성능상 약간 더 빠름 (글로벌 상수)
- 일반적으로 더 많이 사용되는 관례
- 브라우저 호환성: ES1부터 지원 (모든 브라우저)

## 2. String() vs toString()

### 2.1 기본 동작 비교

```javascript
// String() 함수
String(123); // "123"
String(null); // "null"
String(undefined); // "undefined"
String(true); // "true"
String(false); // "false"
String({}); // "[object Object]"
String([]); // ""

// toString() 메서드
123.toString(); // "123"
true.toString(); // "true"
false.toString(); // "false"
[].toString(); // ""
{}.toString(); // "[object Object]"

// null과 undefined는 toString() 메서드가 없음
null.toString(); // TypeError: Cannot read property 'toString' of null
undefined.toString(); // TypeError: Cannot read property 'toString' of undefined
```

### 2.2 안전성 비교

```javascript
// String() 함수 - 안전함
String(null); // "null" - 에러 없음
String(undefined); // "undefined" - 에러 없음

// toString() 메서드 - 위험함
null.toString(); // TypeError: Cannot read property 'toString' of null
undefined.toString(); // TypeError: Cannot read property 'toString' of undefined
```

### 2.3 성능 비교

```javascript
// 성능 테스트
const num = 123;

console.time('String()');
for (let i = 0; i < 1000000; i++) {
  String(num);
}
console.timeEnd('String()');

console.time('toString()');
for (let i = 0; i < 1000000; i++) {
  num.toString();
}
console.timeEnd('toString()');

// 결과: toString()이 약간 더 빠름 (메서드 호출)
```

### 2.4 실제 코드에서의 문제 상황

```javascript
// normalizeVNode에서의 문제 상황
export function normalizeVNode(vNode) {
  if (typeof vNode === "string" || typeof vNode === "number") {
    // ❌ 위험한 경우
    return vNode.toString(); // vNode가 null/undefined면 에러!
  }
}

// 함수형 컴포넌트가 null을 반환하는 경우
const Component = () => null;
const vNode = <Component />;

// 정규화 과정에서
normalizeVNode(vNode); // TypeError 발생!
```

### 2.5 메서드 호출의 근본적 문제

```javascript
// 메서드 호출의 문제점
const obj = null;

// ❌ 메서드 호출 시
obj.toString(); // TypeError: Cannot read property 'toString' of null

// 이유: obj가 null이므로 toString 메서드가 존재하지 않음
// JavaScript는 null/undefined에서 속성 접근을 시도할 때 에러 발생

// ✅ 함수 호출 시
String(obj); // "null" - 안전함

// 이유: String() 함수는 내부적으로 null/undefined를 처리
// 함수는 매개변수를 받아서 안전하게 변환
```

### 2.6 방어적 프로그래밍 관점

```javascript
// 방어적 프로그래밍의 원칙
// "예상치 못한 입력에 대해서도 안전하게 동작해야 함"

// ❌ 방어적이지 않은 코드
function convertToString(value) {
  return value.toString(); // value가 null/undefined면 에러
}

// ✅ 방어적인 코드
function convertToString(value) {
  return String(value); // 모든 입력을 안전하게 처리
}

// 테스트
console.log(convertToString(123)); // "123"
console.log(convertToString("hello")); // "hello"
console.log(convertToString(null)); // "null" - 에러 없음
console.log(convertToString(undefined)); // "undefined" - 에러 없음
```

### 2.7 권장사항

**✅ String() 함수 사용 권장**

**이유:**
- null, undefined도 안전하게 처리
- 타입 체크 없이 사용 가능
- 더 방어적 프로그래밍
- 함수형 컴포넌트의 다양한 반환값 처리 가능

## 3. 실제 코드 적용

### 3.1 배열 평탄화

```javascript
// ✅ 권장: Infinity 사용
export function createVNode(type, props, ...children) {
  if (isFalsy(type)) return "";

  return {
    type,
    props,
    children: children.filter((child) => !isFalsy(child)).flat(Infinity),
  };
}
```

### 3.2 문자열 변환

```javascript
// ✅ 권장: String() 함수 사용
export function normalizeVNode(vNode) {
  if (isFalsy(vNode)) return "";
  
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }
  // ...
}
```

## 4. 성능 vs 안전성

### 4.1 성능 우선 vs 안전성 우선

```javascript
// 성능 우선 (위험함)
arr.flat(Number.POSITIVE_INFINITY); // 약간 더 느림
value.toString(); // null/undefined에서 에러

// 안전성 우선 (권장)
arr.flat(Infinity); // 약간 더 빠름
String(value); // 모든 입력 안전하게 처리
```

### 4.2 선택 기준

| 기준 | Infinity | Number.POSITIVE_INFINITY | String() | toString() |
|------|----------|-------------------------|----------|------------|
| 성능 | 빠름 | 느림 | 느림 | 빠름 |
| 안전성 | 동일 | 동일 | 높음 | 낮음 |
| 가독성 | 높음 | 낮음 | 높음 | 높음 |
| 브라우저 호환성 | ES1+ | ES1+ | ES1+ | ES1+ |

## 5. 결론

### 5.1 최종 권장사항

```javascript
// 배열 평탄화
arr.flat(Infinity);  // ✅ 권장

// 문자열 변환
String(value);       // ✅ 권장
```

### 5.2 핵심 원칙

1. **안전성 > 성능**: 약간의 성능 차이보다 안전성이 더 중요
2. **방어적 프로그래밍**: 예상치 못한 입력에 대해서도 안전하게 동작
3. **가독성**: 코드의 의도가 명확하게 드러나야 함
4. **일관성**: 프로젝트 전체에서 일관된 패턴 사용

### 5.3 가상돔 시스템에서의 중요성

가상돔 시스템에서는 다양한 입력값을 처리해야 하므로:

- **함수형 컴포넌트의 다양한 반환값**: null, undefined, 숫자, 문자열 등
- **사용자 입력의 다양성**: 예상치 못한 타입의 데이터
- **안정성의 중요성**: 런타임 에러 방지

이러한 이유로 `Infinity`와 `String()` 함수 사용을 강력히 권장합니다.

## 6. 참고 자료

- [MDN - Infinity](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Infinity)
- [MDN - String()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- [MDN - Array.prototype.flat()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat) 