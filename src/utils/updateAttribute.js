import { addEvent, removeEvent } from "../lib";
import { isBoolean, isEvent, isNumber, isString } from "./typeCheck";

const knownBooleanAttributeMap = new Map([
  // [JSX 속성 이름, DOM 속성 이름]
  // 실제론 더 많은 속성을 설정해야 함
  ["disabled", "disabled"],
  ["selected", "selected"],
  ["checked", "checked"],
  ["readOnly", "readonly"],
]);

const knownUrlAttributeMap = new Map([
  ["href", "href"],
  ["src", "src"],
]);

export function updateAttribute(target, key, value) {
  if (isEvent(key, value)) {
    addEvent(target, normalizeEventName(key), value);
    return;
  }

  const isValidValue = isString(value) || isNumber(value) || isBoolean(value);
  if (!isValidValue) {
    return;
  }

  if (key === "className") {
    target.className = value;
    return;
  }

  if (knownBooleanAttributeMap.has(key)) {
    target[key] = value;
    return;
  }

  if (knownUrlAttributeMap.has(key)) {
    target[key] = safeUrl(value);
    return;
  }

  target.setAttribute(key, value);
}

export function removeAttribute(target, key, value) {
  if (isEvent(key, value)) {
    removeEvent(target, normalizeEventName(key), value);
    return;
  }

  if (key === "className") {
    target.removeAttribute("class");
    return;
  }

  target.removeAttribute(key);
}

function normalizeEventName(name) {
  return name.replace("on", "").toLowerCase();
}

function safeUrl(value) {
  if (value.startsWith("#")) {
    const url = new URL(location.href);
    url.hash = value;
    return url.toString();
  }

  if (value.startsWith("/")) {
    return new URL(value, location.origin);
  }

  return new URL(value);
}
