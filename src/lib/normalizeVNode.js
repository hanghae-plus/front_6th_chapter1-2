export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  // 2. 문자열 또는 숫자 처리
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // 3. 함수형 컴포넌트 처리
  if (typeof vNode?.type === "function") {
    const componentProps = { ...vNode.props, children: vNode.children };
    const result = vNode.type(componentProps);
    const normalizedResult = normalizeVNode(result);
    // 함수형 컴포넌트 실행 결과의 props가 null인 경우 빈 객체로 변환
    if (normalizedResult && typeof normalizedResult === "object" && normalizedResult.props === null) {
      return {
        ...normalizedResult,
        props: {},
      };
    }
    return normalizedResult;
  }

  // 4. 그 외의 경우 (객체, 배열 등)
  if (vNode && typeof vNode === "object") {
    // 자식 요소들이 있는 경우 재귀적으로 표준화
    if (vNode.children) {
      const normalizedChildren = vNode.children
        .map((child) => normalizeVNode(child))
        .filter((child) => child !== "" && child !== null && child !== undefined);

      return {
        ...vNode,
        children: normalizedChildren,
      };
    }

    // 배열인 경우 각 요소를 재귀적으로 표준화
    if (Array.isArray(vNode)) {
      return vNode
        .map((item) => normalizeVNode(item))
        .filter((item) => item !== "" && item !== null && item !== undefined);
    }
  }

  // 기본적으로 vNode를 그대로 반환
  return vNode;
}
