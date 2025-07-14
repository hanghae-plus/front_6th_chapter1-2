## jsx가 어떻게 createVNode로 변환되는가?

```jsx
// xx.jsx
/** @jsx createVNode */
import { createVNode, renderElement } from "./lib";

```

위의 주석은 개별 파일 레벨에서 `JSX`를 만나면 createVNode 함수로 변환해 라는 힌트가 됩니다.

```js
esbuild: {
    jsx: "transform",
    jsxFactory: "createVNode",
},
optimizeDeps: {
    esbuildOptions: {
    jsx: "transform",
    jsxFactory: "createVNode",
    },
},
```

`esbuild.jsxFactory` : 개발용 변환(vite dev server)
`optimizeDeps.esbuildOptions.jsxFactory` : 종속성 최적화 시에도 같은 규칙을 사용합니다.
`jsx : "transform"` : JSX -> JS 로 변환하는 함수 **(트랜스파일러)** 호출로 바꾸는 방식을 사용

## 왜 작동하는가 ? 

1. JSX 변환 전략 지정
-> automatic 이 아니라 class transform을 사용하면 createVNode 호출 방식이 사용된다.
2. `/** @jsx createVNode */` 주석
-> 이 파일은 별도로 주석에 의해 factory가 고정되기 때문에 vite.config.js의 설정보다 우선됨
3. `createVNode` 함수는 import되어 있음
→ 실제 변환된 코드에서 `createVNode(...)`가 실행 가능


### 정리
| 항목                                    | 효과                                                |
| ------------------------------------- | ------------------------------------------------- |
| `/** @jsx createVNode */`             | 해당 파일에서 JSX → `createVNode`로 변환                   |
| `esbuild.jsxFactory`                  | JSX 변환의 기본 factory 설정                             |
| `optimizeDeps.esbuildOptions`         | 의존성 처리 중에도 동일 JSX 전략 유지                           |
| `jsx: 'transform'`                    | classic JSX transform 모드 사용 (`createElement` 스타일) |
| `import { createVNode } from './lib'` | 변환된 함수가 실제 코드에 존재해야 런타임 에러 안 남                    |


### 트랜스파일러란?

> **트랜스파일러**는 한 프로그래밍 언어로 작성된 소스코드를 다른 프로그래밍 언어 또는 다른 버전의 같은 언어로 변환해주는 도구임

Transpiler === Translator + Compiler (소스 변환기)

**컴파일러** : 고수준언어 -> 저수준언어
**트랜스파일러** : 고수준 언어 -> 다른 고수준 언어 혹은 같은 언어의 다른 버전(jsx를 js로 변환)

#### 예시

1. Babel (ES6 -> ES5) : ES6 자바스크립트를 ES5 자바스크립트로 변환

```ts
// ES6 코드
const add = (a, b) => a + b;

// ES5 코드
var add = function(a, b) {
  return a + b;
};
```

2. TypeScript → JavaScript : 타입 정보가 제거된 JS → TypeScript 트랜스파일 결과

```ts
// TypeScript
function greet(name: string): string {
  return "Hello, " + name;
}

// JavaScript
function greet(name) {
  return "Hello, " + name;
}
````

3. JSX -> JS(createVNode 사용) : JSX는 브라우저가 이해하지 못하니까 트랜스파일해서 JS로 바꿔야 함

```js
const el = <h1>Hello</h1>;

const el = createVNode("h1", null, "Hello");
```

## esBuild 트랜스파일 구조 요약

`esbuild`는 Babel과 달리, 플러그인 기반이 아닌 고정된 변환기이며,
Go 언어로 작성된 컴파일러 커어를 사용하여 고속 파싱 + 트랜스파일을 수행합니다.

1. Parse (구문 분석)

- esbuild는 자체 파서로 코드를 빠르게 분석하여 추상구문 트리 (**AST**)를 만듭니다.

- JSX 구문 <div>hello</div>는 JSXElement

2. Transform (AST 변환)
예: jsxFactory: "createVNode"인 경우

```jsx

<div id="foo">bar</div>

AST 변환 후 -> createVNode("div", { id: "foo" }, "bar");
```

| 단계           | 역할              | 예시                                  |
| ------------ | --------------- | ----------------------------------- |
| 1. Parse     | 코드 → AST        | `<div>Hello</div>` → JSXElement     |
| 2. Transform | JSX → 함수 호출 AST | `JSXElement` → `createVNode(...)`   |
| 3. Generate  | AST → JS 코드     | `createVNode("div", null, "Hello")` |

### esBuild 의 깃허브의 자세한 내용이 궁금하다면?

- JSX Factory 적용 처리
👉 [esbuild/internal/js_ast/js_ast.go](https://github.com/evanw/esbuild/blob/main/internal/js_ast/js_ast.go)
JSX 요소를 createElement나 custom factory 함수 호출로 바꾸는 처리 포함.

- JSX 관련 설정 처리 (jsxFactory, jsxFragment)
👉 [esbuild/internal/config/config.go](https://github.com/evanw/esbuild/blob/main/internal/config/config.go)
CLI나 API로 넘긴 설정(jsxFactory, jsxFragment, jsx)을 처리합니다.

### 참고문서

- https://ko.vite.dev/config/shared-options.html#esbuild
- https://esbuild.github.io/api/#jsx
- https://esbuild.github.io/api/#jsx-factory