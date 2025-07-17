export const BASE_URL = import.meta.env.PROD ? '/front_6th_chapter1-2/' : '/';

// 자주 사용하게 되는 문자열 정리
export const CHECK_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  FUNCTION: 'function',
  OBJECT: 'object',
};

export const ATTR = {
  CLASSNAME: 'className',
  STYLE: 'style',
  CLASS: 'class',
};

export const BOOLEAN_ATTR = ['checked', 'selected', 'readOnly', 'disabled'];

export const EVENT_TYPES = ['click', 'focus', 'blur', 'mouseover', 'keydown', 'keyup', 'change'];
