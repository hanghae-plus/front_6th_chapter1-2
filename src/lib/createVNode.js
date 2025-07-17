/**
 * 자식 노드들을 평탄화하고 불필요한 값들을 제거합니다.
 * @param {Array} items - 평탄화할 자식 노드들
 * @returns {Array} 평탄화된 자식 노드들
 */
const flattenChildren = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .flat(Infinity)
    .filter((child) => child !== null && child !== undefined && child !== false && child !== true);
};

/**
 * Virtual DOM 노드를 생성합니다.
 * @param {string|Function} type - 엘리먼트 타입 또는 컴포넌트 함수
 * @param {Object|null} props - 엘리먼트 속성들
 * @param {...any} children - 자식 노드들
 * @returns {VNode} Virtual DOM 노드
 */
export const createVNode = (type, props, ...children) => {
  if (type == null) {
    throw new Error("createVNode: type은 null이나 undefined일 수 없습니다.");
  }

  return {
    type,
    props: props || null,
    children: flattenChildren(children),
  };
};
