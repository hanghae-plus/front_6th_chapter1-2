//
// 가상돔 노드는 객체 형태로 표현되며, 이를 브라우저가 이해할 수 있는 형태로 변환하는 작업
// 예를 들어, 가상돔 노드에 포함된 이벤트 핸들러는 문자열 형태로 저장되어 있으므로, 이를 함수 형태로 변환하는 작업이 필요
// 이 함수는 가상돔 노드를 정규화하는 작업을 수행하며, 이를 통해 가상돔 노드를 브라우저가 이해할 수 있는 형태로 변환할 수 있음

export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    // 비슷한내용의 블로그를 보다가
    // return을 document.createTextNode("") 로 해서 빈 문자열로 바꿔봤는데
    // 이유를 알고 싶어서 찾아보니까 이유는 잘모르겠습니다.
    // 근데 빈문자열이 정규화단계에서는 더 좋다고 합니다.
    // 돔환경이 필요하기떄문에
    // 실제 돔을 조작하는 단계해서 하는게 좋다고 하네요

    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }

  if (typeof vNode === "object") {
    if (typeof vNode.type === "function") {
      // vNode는 Jsx형태로 되어있어서
      // [Function TestComponent] 형태로 되어있습니다.
      // TestComponent는 인자로 아무거도 받지 않아서 props가 null이든 뭐든 상관이 없어서 그냥 넣어도 됩니다.
      const rendered = vNode.type(vNode.props);

      // TestCode에서 UnorderList.
      // const UnorderedList = ({ children, ...props }) => <ul {...props}>{children}</ul>;로
      // 인자를 props를 받기에 예외처리를 해서 넣어줬습니다.
      // 그래서 렌더링 된 자식 노드들을 가져왔습니다.
      const h = rendered.type(rendered.props || {});

      // props를 넣어서 렌더링 된 자식 노드들을 가져왔습니다.
      const renderChildren = rendered.children.map((child) => {
        const newRender = child.type(child.props || {});
        return { ...newRender, children: [...newRender.children, ...child.children] };
      });

      return { type: h.type, props: h.props, children: renderChildren };
    }

    // falsy 값은 자식 노드에서 제거되어야 한다.
    if (typeof vNode.type === "string") {
      const vNodeChildren = vNode.children;

      const renderChildren = vNodeChildren.filter((child) => {
        console.log(child);
        // falsy 값들 완전 제거
        return child !== null && child !== undefined && typeof child !== "boolean" && child !== "";
      });

      console.log(renderChildren);
      return { type: vNode.type, props: vNode.props, children: renderChildren };
    }
  }
  return vNode;
}
// 다른 분 코드를 봤을땐 재귀를 이용해서 하셨다.
// 되게 짧아서 사용해보려고 하는데

/// AI 가 만든 코드

/**
 * 
 * export function normalizeVNode(vNode) {
  // 1. 원시 타입들 처리
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";  // 빈 문자열
  }
  
  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();  // 문자열로 변환
  }
  
  // 2. 함수 컴포넌트 → 재귀적으로 실행
  if (typeof vNode.type === "function") {
    const rendered = vNode.type(vNode.props || {});
    return normalizeVNode(rendered);  // 🔄 재귀 호출!
  }
  
  // 3. 배열 처리 (children 배열)
  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode);
  }
  
  // 4. 일반 객체 (HTML 태그 노드)
  if (vNode && typeof vNode.type === "string") {
    return {
      ...vNode,
      children: vNode.children?.map(normalizeVNode) || []
    };
  }
  
  // 5. 그 외 (예외 처리)
  return vNode;
}
 */

// 나는 왜 재귀로 했을때 빈값을 호출할까 고민을 해봐야겠다
