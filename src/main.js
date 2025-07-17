// main.js
import { initRender } from "./render";
import { loadCartFromStorage } from "./services";
import { router } from "./router";
import { BASE_URL } from "./constants.js";

/**
 * 개발 환경에서만 MSW 워커 시작
 */
const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

/**
 * 404 페이지에서 리다이렉트된 경우 처리
 */
function handleRedirect() {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect !== location.href) {
    history.replaceState(null, null, redirect);
  }
}

/**
 * 애플리케이션 초기화
 */
function main() {
  console.log("🚀 애플리케이션이 시작되었습니다.");

  console.log("✅ MSW 워커 시작 완료");

  // 404 리다이렉트 처리
  handleRedirect();
  console.log("✅ 404 리다이렉트 처리 완료");

  loadCartFromStorage();
  console.log("✅ 장바구니 데이터 복원 완료");

  initRender();
  console.log("✅ 렌더링 시스템 초기화 완료");

  router.start();
  console.log("✅ 렌더링 설정 완료");

  console.log("🎉 애플리케이션 초기화 완료!");
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
