## 과제 체크포인트

### 배포 링크

https://hwirin-kim.github.io/front_6th_chapter1-2/

### 기본과제

#### 가상돔을 기반으로 렌더링하기

- [x] createVNode 함수를 이용하여 vNode를 만든다.
- [x] normalizeVNode 함수를 이용하여 vNode를 정규화한다.
- [x] createElement 함수를 이용하여 vNode를 실제 DOM으로 만든다.
- [x] 결과적으로, JSX를 실제 DOM으로 변환할 수 있도록 만들었다.

#### 이벤트 위임

- [x] 노드를 생성할 때 이벤트를 직접 등록하는게 아니라 이벤트 위임 방식으로 등록해야 한다
- [x] 동적으로 추가된 요소에도 이벤트가 정상적으로 작동해야 한다
- [x] 이벤트 핸들러가 제거되면 더 이상 호출되지 않아야 한다

### 심화 과제

#### Diff 알고리즘 구현

- [x] 초기 렌더링이 올바르게 수행되어야 한다
- [x] diff 알고리즘을 통해 변경된 부분만 업데이트해야 한다
- [x] 새로운 요소를 추가하고 불필요한 요소를 제거해야 한다
- [x] 요소의 속성만 변경되었을 때 요소를 재사용해야 한다
- [x] 요소의 타입이 변경되었을 때 새로운 요소를 생성해야 한다

## 과제 셀프회고

### 기술적 성장

지난번 과제가 SPA를 어떻게든 구현해냈다면, 이번 과제는 SPA의 최적화된 렌더링을 위해 가상돔을 사용하는 방법을 이해했다고 생각한다.<br>
구현 과정에서 제대로 이해하지 못했던 DOM의 지식들도 있었다.<br>

- DOM의 attribute와 property의 차이
  - DOM요소에는 HTML의 attribute와 자바스크립트 property가 따로 존재한다.
  - 예시로 `<input checked>` 처럼 HTML에 명시된 값은 input.getAttribute("checked")로 접근하면 해당 값이 true이건 false이건 "" 로 나온다.
  - 따라서 실제 동작 여부는 input.checked처럼 property를 통해 확인하고 제어해야 한다.
  ```
  if (BOOLEAN_PROPS.includes(key)) {
      dom[key] = Boolean(newVal); // checked, disable, selected 같은 boolean 속성들은 프로퍼티로 처리!
  } else if (key in dom && key !== "children") {
       dom[key] = newVal;           // 일반적인 property 처리
  } else {
      dom.setAttribute(key, newVal); // 둘 다 해당하지 않으면 attribute로 처리
  }
  ```
- childNodes.length와 children.length의 차이
  - 초과된 자식을 제거하려고 childNodes.length를 사용했었는데, 테스트 코드에서 children.length를 비교하는 부분이 있어서 찾아보게 되었다.
  - childNodes.length는 텍스트 노드나 주석 노드까지 포함한다. (모든 자식 노드!)
  - children.length는 오직 element 노드만 포함한다.

- children은 읽기 전용이다!
  - basic과 advanced 테스트를 모두 통과하고나서 e2e를 돌렸는데 바로 실패했다.
  - 원인의 에러는 다음과 같았다.

  ```
  Uncaught TypeError: Cannot set property children of #<Element> which has only a getter
  at updateAttributes (updateElement.js:26:18)
  ```

  - 위 에러 메시지는 children은 getter only이므로 속성값을 직접 할당할수없다는 내용이였다.
  - 원인은 `dom[key] = newVal;` 이렇게 작성한 코드 때문이였는데, key가 "children"일때도 할당되면서 발생된 에러였다.
  - 그래서 else if에 조건문으로 `key in dom && key !== "children"`을 넣어서 updateAttributes에서는 children을 아예 건너 뛰도록 하였다.

### 코드 품질

코드 품질에서 만족스러웠던 구현은 딱히 없는것 같다. <br>
뭔가 테스트 코드를 보고 이렇게 구현하면 되겠구나.. 하는 힌트를 많이 얻었고, 방향이 이미 잘 제시되어 있다고 느껴저서 나는 그저 그에 알맞게 구현했다고 생각이 든다.
<br>
<br>
리팩토링이 필요한 부분이라기 보다 리액트에서는 key값이 존재하는데, 이번 과제에는 key가 구현되어있지 않아서 이걸 구현해보면 재밌지 않을까 생각이 든다. <br>
key 값이 존재하면 만약 같은 엘리먼트가 순서만 달라진 경우 기존 DOM을 재사용하고 위치만 바꿔주었을 것이다.<br>
그렇게 되면 내부 상태도 유지 될것이니 더 효율적이라고 생각이 든다.

### 학습 효과 분석

이번 과제의 가장 큰 학습 효과는 가상DOM을 어떻게 만들어 내고, 어떻게 변화된 부분만 변경시키는지를 몸소 체험했다는 것이다. <br>
특히 단순하게 "DOM구조를 가진 가상의 객체를 만들어서 변경된 부분만 바꿔주면돼!" 라고만 알았던것을 직접 구현해보니, 그보다 훨씬 많은 부분이 고려되고있었다는것을 알게 되었다.<br>
특히 다양한 노드 타입들에 대한 처리들이 필요했고, 이벤트를 어떻게 위임할것인지도 매우 중요한 부분이였다는것이 느껴졌다.<br>
이벤트를 모든 DOM에 부여하지 않고, 공통 상위 요소에 하나의 이벤트 핸들러로 등록하고, 버블링을 이용해 실제 이벤트 발생 요소를 추적하는 방식으로 구현이 되어있다.<br>
메모리 절약도 될 것이고, 동적으로 생성된 엘리먼트에도 이벤트가 잘 적용될 것이다. 또한 요소가 제거될 때도 따로 신경 쓸 필요가 없다는 것을 알게 되었다.
<br>

### 과제 피드백

개인적으로 이번 과제가 지난 과제보다 약간 더 어려웠다. <br>
JSX를 vNode로 만들고, vNode를 정규화 시킨 뒤, 실제 돔으로 변경하는 부분 까지는 아주 쉽게 따라왔던것 같다. <br>
<br>
그 이후에 이벤트를 위임하는 단계, Diff 알고리즘을 구현하는 단계에서 많은 시간을 소모했다.<br>
이 부분은 테스트가 통과하지 전까지 직접 수정 -> AI로 수정 -> 또 직접 수정 -> AI로 수정.. 이 과정을 굉장히 여러번 거치면서 조금씩 감이 잡히기 시작했다. (사실 이 시간이 거의 하루가 넘는 시간이 걸렸다.)<br>
<br>
이런 시행착오를 거치고 나니 지난번 진행했던 과제에서 내가 궁금했었던 가상돔을 사용하여 변경된 부분을 찾고 해당 부분만 재 렌더링 시키는 방식이 이제는 머릿속에 큰그림으로 잘 그려지고 있다.<br>
물론 상세하게는 코드를 봐야만 기억이 난다..<br>

## 리뷰 받고 싶은 내용

createElement를 만들때, 테스트에 명시적으로 VNode가 숫자이면 문자열로 바꾸라는 테스트가 있었습니다.<br>
그런데 normalizeVNode에서 이미 숫자를 문자열로 변환하였는데 createElement에서 왜 다시 필요한지 궁금합니다.<br>
혹시 normalizeVNode를 지나도 숫자가 나오는 경우가 있는걸까요..? 아니면 createElement가 정규화를 거치지 않은 다른 vNode를 사용하는 일이 생기는걸까요?
