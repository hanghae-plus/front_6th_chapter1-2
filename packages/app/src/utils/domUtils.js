/**
 * 요소 생성
 * @param {string} tag - 태그명
 * @param {Object} options - 속성과 내용
 * @returns {Element} 생성된 요소
 */

/**
 * 스크롤 위치 감지
 * @param {number} threshold - 하단에서의 거리 (px)
 * @returns {boolean} 하단 근처인지 여부
 */
export const isNearBottom = (threshold = 200) => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  return scrollTop + windowHeight >= documentHeight - threshold;
};
