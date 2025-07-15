export function isNotRenderable(child) {
  return child == null || child === false;
}

export function isNullish(value) {
  return value == null;
}

export function isBoolean(value) {
  return typeof value === "boolean";
}

export function isNumber(value) {
  return typeof value === "number";
}

export function isString(value) {
  return typeof value === "string";
}

export function isFunction(value) {
  return typeof value === "function";
}

export function isEvent(key, value) {
  return key.startsWith("on") && isFunction(value);
}

export function isVNode(value) {
  if (typeof value !== "object" || value === null) {
    // 객체 형태가 아니면 JSX 가 아니다.
    return false;
  }

  if (!("type" in value) || !("props" in value) || !("children" in value)) {
    // 객체 형태이지만 필수 프로퍼티가 없으면 JSX 가 아니다.
    return false;
  }

  if (!(isString(value.type) || isFunction(value.type))) {
    // type 값이 문자열 또는 함수가 아니면 JSX 가 아니다.
    // 현재는 함수형 컴포넌트만 고려
    return false;
  }

  if (typeof value.props !== "object") {
    // props 값이 객체가 아니면 JSX 가 아니다.
    return false;
  }

  if (!Array.isArray(value.children)) {
    // children 값이 배열이 아니면 JSX 가 아니다.
    return false;
  }

  return true;
}
