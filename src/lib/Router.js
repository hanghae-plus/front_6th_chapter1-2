/**
 * 간단한 SPA 라우터
 */
import { createObserver } from "./createObserver.js";

export class Router {
  #routes;
  #route;
  #observer = createObserver();
  #baseUrl;

  constructor(baseUrl = "") {
    this.#routes = new Map();
    this.#route = null;
    this.#baseUrl = baseUrl.replace(/\/$/, "");

    window.addEventListener("popstate", () => {
      console.log("popstate event triggered");
      this.#route = this.#findRoute();
      this.#observer.notify();
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-link]")) {
        e.preventDefault();
        const url = e.target.getAttribute("href") || e.target.closest("[data-link]").getAttribute("href");
        if (url) {
          this.push(url);
        }
      }
    });
  }

  get baseUrl() {
    return this.#baseUrl;
  }

  get query() {
    return Router.parseQuery(window.location.search);
  }

  set query(newQuery) {
    const newUrl = Router.getUrl(newQuery, this.#baseUrl);
    this.push(newUrl);
  }

  get params() {
    return this.#route?.params ?? {};
  }

  get route() {
    return this.#route;
  }

  get target() {
    return this.#route?.handler;
  }

  subscribe(fn) {
    this.#observer.subscribe(fn);
  }

  /**
   * 라우트 등록
   * @param {string} path - 경로 패턴 (예: "/product/:id")
   * @param {Function} handler - 라우트 핸들러
   */
  addRoute(path, handler) {
    // 경로 패턴을 정규식으로 변환
    const paramNames = [];
    const regexPath = path
      .replace(/:\w+/g, (match) => {
        paramNames.push(match.slice(1)); // ':id' -> 'id'
        return "([^/]+)";
      })
      .replace(/\//g, "\\/");

    const regex = new RegExp(`^${regexPath}$`); // baseUrl 제거

    console.log("Adding route:", path, "regex:", regex); // 디버깅용

    this.#routes.set(path, {
      regex,
      paramNames,
      handler,
    });
  }

  #findRoute(url = window.location.pathname) {
    const { pathname } = new URL(url, window.location.origin);

    // baseUrl 제거하여 실제 경로만 추출
    let actualPath = pathname;
    if (this.#baseUrl && pathname.startsWith(this.#baseUrl)) {
      actualPath = pathname.slice(this.#baseUrl.length);
    }

    console.log("Finding route for pathname:", pathname, "actualPath:", actualPath); // 디버깅용

    for (const [routePath, route] of this.#routes) {
      console.log("Checking route:", routePath, "regex:", route.regex); // 디버깅용
      const match = actualPath.match(route.regex);
      if (match) {
        console.log("Route matched:", routePath); // 디버깅용
        // 매치된 파라미터들을 객체로 변환
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        return {
          ...route,
          params,
          path: routePath,
        };
      }
    }
    console.log("No route found for:", actualPath); // 디버깅용
    return null;
  }

  /**
   * 네비게이션 실행
   * @param {string} url - 이동할 경로
   */
  push(url) {
    try {
      // 이미 baseUrl이 포함된 경로인지 확인
      let fullUrl;
      if (url.startsWith(this.#baseUrl)) {
        // 이미 baseUrl이 포함된 경우 그대로 사용
        fullUrl = url;
      } else if (url.startsWith("/")) {
        // 절대 경로인 경우 baseUrl 추가
        fullUrl = this.#baseUrl + url;
      } else {
        // 상대 경로인 경우 baseUrl + "/" + url
        fullUrl = this.#baseUrl + "/" + url;
      }

      const prevUrl = window.location.pathname + window.location.search;

      // 히스토리 업데이트
      if (prevUrl !== fullUrl) {
        window.history.pushState(null, "", fullUrl);
      }

      this.#route = this.#findRoute(fullUrl);
      this.#observer.notify();
    } catch (error) {
      console.error("라우터 네비게이션 오류:", error);
    }
  }

  /**
   * 라우터 시작
   */
  start() {
    this.#route = this.#findRoute();
    this.#observer.notify();
  }

  /**
   * 안전한 뒤로가기
   */
  safeBack() {
    console.log("=== safeBack called ===");
    console.log("Current pathname:", window.location.pathname);
    console.log("Current href:", window.location.href);
    console.log("Base URL:", this.#baseUrl);
    console.log("History length:", window.history.length);
    console.log("Current state:", window.history.state);

    // 현재 경로가 홈이 아닌 경우에만 뒤로가기
    const currentPath = window.location.pathname;
    const homePath = this.#baseUrl + "/";

    console.log("Current path:", currentPath);
    console.log("Home path:", homePath);
    console.log("Is current path home?", currentPath === homePath || currentPath === this.#baseUrl);

    if (currentPath !== homePath && currentPath !== this.#baseUrl) {
      console.log("Going back in history...");
      window.history.back();
    } else {
      console.log("Already at home, staying here");
    }
  }

  /**
   * 쿼리 파라미터를 객체로 파싱
   * @param {string} search - location.search 또는 쿼리 문자열
   * @returns {Object} 파싱된 쿼리 객체
   */
  static parseQuery = (search = window.location.search) => {
    const params = new URLSearchParams(search);
    const query = {};
    for (const [key, value] of params) {
      query[key] = value;
    }
    return query;
  };

  /**
   * 객체를 쿼리 문자열로 변환
   * @param {Object} query - 쿼리 객체
   * @returns {string} 쿼리 문자열
   */
  static stringifyQuery = (query) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    }
    return params.toString();
  };

  static getUrl = (newQuery, baseUrl = "") => {
    const currentQuery = Router.parseQuery();
    const updatedQuery = { ...currentQuery, ...newQuery };

    // 빈 값들 제거
    Object.keys(updatedQuery).forEach((key) => {
      if (updatedQuery[key] === null || updatedQuery[key] === undefined || updatedQuery[key] === "") {
        delete updatedQuery[key];
      }
    });

    const queryString = Router.stringifyQuery(updatedQuery);
    return `${baseUrl}${window.location.pathname.replace(baseUrl, "")}${queryString ? `?${queryString}` : ""}`;
  };
}
