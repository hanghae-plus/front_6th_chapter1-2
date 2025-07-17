import { createObserver } from "./createObserver";

/**
 * Redux 스타일의 Store 생성 함수
 * @param {Function} reducer - (state, action) => newState 형태의 reducer 함수
 * @param {*} initialState - 초기 상태
 * @returns {Object} { getState, dispatch, subscribe }
 */
export const createStore = (reducer, initialState) => {
  const { subscribe, notify } = createObserver();

  let state = initialState;

  const getState = () => state;

  const dispatch = (action) => {
    const newState = reducer(state, action);
    if (newState !== state) {
      state = newState;
      notify(); // 상태가 변경되면 구독자들에게 알림
    }
  };

  return { getState, dispatch, subscribe };
};
