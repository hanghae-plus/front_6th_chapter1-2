export const BASE_URL = import.meta.env.PROD ? "/front_6th_chapter1-2/" : "/";
// checked, selected 등 property 로만 조작해야 하는 boolean 속성 (attribute 직접 조작X)
export const PROPERTY_ONLY_PROPS = new Set(["checked", "selected"]);

// disabled, readonly 등 attribute로 추가/제거해서 조작해야 하는 boolean 속성
export const BOOLEAN_ATTRIBUTE_PROPS = new Set(["disabled", "readOnly", "multiple", "hidden"]);
export const EVENT_TYPE_MAP = {
  // Mouse Events
  click: "onClick",
  dblclick: "onDoubleClick",
  mousedown: "onMouseDown",
  mouseup: "onMouseUp",
  mouseover: "onMouseOver",
  mouseout: "onMouseOut",
  mousemove: "onMouseMove",
  mouseenter: "onMouseEnter",
  mouseleave: "onMouseLeave",
  contextmenu: "onContextMenu",
  wheel: "onWheel",

  // Keyboard Events
  keydown: "onKeyDown",
  keyup: "onKeyUp",
  keypress: "onKeyPress",

  // Focus Events
  focus: "onFocus",
  blur: "onBlur",
  focusin: "onFocusIn",
  focusout: "onFocusOut",

  // Form Events
  submit: "onSubmit",
  reset: "onReset",
  change: "onChange",
  input: "onInput",
  select: "onSelect",
  invalid: "onInvalid",

  // Drag Events
  drag: "onDrag",
  dragstart: "onDragStart",
  dragend: "onDragEnd",
  dragover: "onDragOver",
  dragenter: "onDragEnter",
  dragleave: "onDragLeave",
  drop: "onDrop",

  // Touch Events
  touchstart: "onTouchStart",
  touchmove: "onTouchMove",
  touchend: "onTouchEnd",
  touchcancel: "onTouchCancel",

  // Pointer Events
  pointerdown: "onPointerDown",
  pointerup: "onPointerUp",
  pointermove: "onPointerMove",
  pointerover: "onPointerOver",
  pointerout: "onPointerOut",
  pointerenter: "onPointerEnter",
  pointerleave: "onPointerLeave",
  pointercancel: "onPointerCancel",
  gotpointercapture: "onGotPointerCapture",
  lostpointercapture: "onLostPointerCapture",

  // Media Events
  play: "onPlay",
  pause: "onPause",
  ended: "onEnded",
  loadstart: "onLoadStart",
  loadeddata: "onLoadedData",
  loadedmetadata: "onLoadedMetadata",
  canplay: "onCanPlay",
  canplaythrough: "onCanPlayThrough",
  timeupdate: "onTimeUpdate",
  volumechange: "onVolumeChange",
  waiting: "onWaiting",
  seeking: "onSeeking",
  seeked: "onSeeked",
  stalled: "onStalled",
  suspend: "onSuspend",
  abort: "onAbort",
  error: "onError",
  emptied: "onEmptied",
  ratechange: "onRateChange",
  durationchange: "onDurationChange",
  progress: "onProgress",

  // Image Events
  load: "onLoad",

  // Animation Events
  animationstart: "onAnimationStart",
  animationend: "onAnimationEnd",
  animationiteration: "onAnimationIteration",

  // Transition Events
  transitionstart: "onTransitionStart",
  transitionend: "onTransitionEnd",
  transitionrun: "onTransitionRun",
  transitioncancel: "onTransitionCancel",

  // Clipboard Events
  copy: "onCopy",
  cut: "onCut",
  paste: "onPaste",

  // Composition Events
  compositionstart: "onCompositionStart",
  compositionupdate: "onCompositionUpdate",
  compositionend: "onCompositionEnd",

  // Scroll Events
  scroll: "onScroll",

  // Resize Events
  resize: "onResize",

  // Selection Events
  selectstart: "onSelectStart",
  selectionchange: "onSelectionChange",

  // UI Events
  beforeunload: "onBeforeUnload",
  unload: "onUnload",
  hashchange: "onHashChange",
  popstate: "onPopState",

  // Toggle Events
  toggle: "onToggle",

  // Detail Events
  details: "onDetails",

  // Security Events
  securitypolicyviolation: "onSecurityPolicyViolation",

  // Storage Events
  storage: "onStorage",

  // Message Events
  message: "onMessage",
  messageerror: "onMessageError",

  // Online/Offline Events
  online: "onOnline",
  offline: "onOffline",

  // Page Visibility Events
  visibilitychange: "onVisibilityChange",

  // Fullscreen Events
  fullscreenchange: "onFullscreenChange",
  fullscreenerror: "onFullscreenError",

  // Orientation Events
  orientationchange: "onOrientationChange",

  // Device Events
  devicemotion: "onDeviceMotion",
  deviceorientation: "onDeviceOrientation",

  // Gamepad Events
  gamepadconnected: "onGamepadConnected",
  gamepaddisconnected: "onGamepadDisconnected",

  // Print Events
  beforeprint: "onBeforePrint",
  afterprint: "onAfterPrint",

  // Canvas Events
  webglcontextlost: "onWebGLContextLost",
  webglcontextrestored: "onWebGLContextRestored",
};
