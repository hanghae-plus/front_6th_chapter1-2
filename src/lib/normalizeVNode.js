export function normalizeVNode(vNode) {
  // null, undefined, boolean (true/false)은 빈 문자열로 변환
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") return "";

  // 문자열과 숫자는 문자열로 변환
  if (typeof vNode === "string" || typeof vNode === "number") return String(vNode);

  // 객체(VNode) 처리
  if (typeof vNode === "object") {
    let { type, props, children } = vNode;

    // 함수형 컴포넌트면 호출해서 렌더링 결과 가져오기
    if (typeof type === "function") {
      const renderedVNode = type({ ...(props ?? {}), children });
      return normalizeVNode(renderedVNode);
    }

    // children이 배열이 아닐 경우 배열로 감싸기
    if (!Array.isArray(children)) {
      children = [children];
    }

    // children 평탄화 함수 (중첩 배열 제거)
    function flatten(arr) {
      return arr.reduce((acc, val) => {
        if (Array.isArray(val)) {
          acc.push(...flatten(val));
        } else if (val !== null && val !== undefined && val !== false) {
          acc.push(val);
        }
        return acc;
      }, []);
    }

    children = flatten(children);

    // 자식들 재귀 정규화 및 빈 문자열 제외
    const normalizedChildren = [];
    for (const child of children) {
      const normalizedChild = normalizeVNode(child);
      if (normalizedChild !== "") {
        normalizedChildren.push(normalizedChild);
      }
    }

    return {
      type,
      props: props ?? null,
      children: normalizedChildren,
    };
  }

  // 기타 타입은 문자열로 변환
  return String(vNode) || "";
}
