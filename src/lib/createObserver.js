export const createObserver = () => {
  const listeners = new Set(); // 구독자 목록 (중복 방지)
  const subscribe = (fn) => listeners.add(fn); // 구독자 추가
  const notify = () => listeners.forEach((listener) => listener()); // 모든 구독자에게 알림

  return { subscribe, notify };
};
