// describe("normalizeVNode", () => {
//   it.each([
//     [null, ""],
//     [undefined, ""],
//     [true, ""],
//     [false, ""],
//   ])("null, undefined, boolean 값은 빈 문자열로 변환되어야 한다. (%s)", (input, expected) => {
//     expect(normalizeVNode(input)).toBe(expected);
//   });

// it.each([
//   ["hello", "hello"],
//   [123, "123"],
//   [0, "0"],
//   [-42, "-42"],
// ])("문자열과 숫자는 문자열로 변환되어야 한다. (%s)", (input, expected) => {
//   expect(normalizeVNode(input)).toBe(expected);
// });

// {
//   type: "ul",
//   props: null,
//   children: [
//     {
//       type: "li",
//       props: { id: "item-1", className: "list-item" },
//       children: ["- Item 1"]
//     },
//     {
//       type: "li",
//       props: { id: "item-2", className: "list-item" },
//       children: ["- Item 2"]
//     },
//     {
//       type: "li",
//       props: { id: "item-3", className: "list-item last-item" },
//       children: ["- Item 3"]
//     }
//   ]
// }

// 을 normalizeVNOde에 넣으면
// <ul {...{}}>
//   <li id="item-1" className="list-item ">
//     {"- "}Item 1
//   </li>
//   <li id="item-2" className="list-item ">
//     {"- "}Item 2
//   </li>
//   <li id="item-3" className="list-item last-item">
//     {"- "}Item 3
//   </li>
// </ul>,

export function normalizeVNode(vNode) {
  //  null/undefined/boolean:
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  //   IF vnode.type이 함수(컴포넌트):
  //  children만 재귀적으로 정규화하여 새 객체 반환

  // vnode가 string/number:
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // vnode가 배열:
  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode);
  }

  //

  //  재귀로 돌아오는거 하나 만들어줘야함

  // {...{}} 이거하고 {"- "} 뭐여
  // 만약에 type 이 컴포넌트 == 함수 면 풀어주고 다시 normalized에 넣어야할듯
  // if (vNode.type === "function"){
  //   newObject = {} 어케하지
  // }

  if (typeof vNode.type === "function") {
    return normalizeVNode(vNode.type({ ...vNode.props, children: vNode.children }));
  }
  return {
    type: vNode.type,
    props: vNode.props,
    children: vNode.children.map(normalizeVNode).filter(Boolean),
  };
}
