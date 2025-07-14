import { isArray, isBoolean, isEmptyString, isFunction, isNil, isNumber, isString } from "../utils";

export function normalizeVNode(vNode) {
  if (isNil(vNode) || isBoolean(vNode)) {
    return "";
  }

  if (isString(vNode)) {
    return vNode;
  }

  if (isNumber(vNode)) {
    return vNode.toString();
  }

  if (isArray(vNode)) {
    return vNode.map(normalizeVNode).filter((v) => !isEmptyString(v));
  }

  if (isFunction(vNode.type)) {
    const props = { ...(vNode.props ?? {}), children: vNode.children };
    return normalizeVNode(vNode.type(props));
  }

  return {
    ...vNode,
    children: normalizeChildren(vNode.children),
  };
}

const normalizeChildren = (children) => {
  return isArray(children) ? children.map(normalizeVNode).filter((c) => !isEmptyString(c)) : normalizeVNode(children);
};
