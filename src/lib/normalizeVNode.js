export function normalizeVNode(vNode) {
  console.log("vNode", vNode);
  
  if (vNode == null || vNode == undefined || typeof(vNode) == "boolean") {
    return "";
  }

  if (typeof(vNode) == "number") {
    return String(vNode);
  }

  // TODO 정규화 표현 어떻게 구현해야하는가? 테스트 코드가 잘 이해되지 않음.
  // if (typeof vNode.type === "function") {
  // }
  
  return vNode;
}
