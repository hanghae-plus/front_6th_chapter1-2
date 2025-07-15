export function normalizeVNode(vNode) {
  // 1. null, undefined, boolean → ""
  if (vNode === null || vNode === undefined || typeof vNode === 'boolean') {
    return "";
  }

  // 2. 문자열, 숫자 → 문자열
	if (typeof vNode === 'string' || typeof vNode === 'number') {
    return String(vNode);
  }

  // 3. 함수형 컴포넌트 처리
  if (vNode && typeof vNode === 'object' && typeof vNode.type === 'function') {
    const props = vNode.props || {};
    
    // children을 props로 전달
    if (vNode.children && vNode.children.length > 0) {
      // children이 있으면 props.children으로 전달
      props.children = vNode.children.length === 1 ? vNode.children[0] : vNode.children;
    }
    
    const result = vNode.type(props);
    return normalizeVNode(result);
  }
  
  // 4. 일반 vNode 객체 처리 (children 정규화)
  if (vNode && typeof vNode === 'object' && vNode.children) {
    return {
      ...vNode,
      children: vNode.children
        .map(child => normalizeVNode(child))
        .filter(child => child !== "") // 빈 문자열 제거
    };
  }
  
  return vNode;
}