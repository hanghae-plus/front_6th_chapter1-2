import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
const basePath = import.meta.env.PROD ? "/front_6th_chapter1-1" : "";

// MSW 워커 설정
export const worker = setupWorker(...handlers);

export const workerOptions = import.meta.env.PROD
  ? {
      serviceWorker: {
        url: `${basePath}/mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }
  : {
      onUnhandledRequest: "bypass",
    };
