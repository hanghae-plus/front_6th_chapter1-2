/**
 * 노드를 정규화하는 함수
 * @param {*} vNode {type, props, children}
 * @returns vNode
 */

export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // * 함수형 컴포넌트 일 때
  // * children도 모두 vNode로 변환되어야 한다.
  if (typeof vNode === "object" && typeof vNode.type === "function") {
    const Component = vNode.type;
    const props = vNode.props ?? {};
    const jsx = Component(props);

    const normalizedVNode = normalizeVNode(jsx);

    let children = [];
    if (jsx.children.length <= 1) {
      children = [...jsx.children, ...vNode.children];
    } else {
      children = jsx.children.map(normalizeVNode);
    }

    const result = {
      type: normalizedVNode.type,
      props: jsx.props || {},
      children,
    };

    return result;
  }

  return vNode;
}
