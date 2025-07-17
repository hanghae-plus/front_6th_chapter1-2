import { expect, test } from "@playwright/test";

// 테스트 설정
test.describe.configure({ mode: "serial" });

// 헬퍼 함수들
class E2EHelpers {
  constructor(page) {
    this.page = page;
  }

  // 페이지 로딩 대기
  async waitForPageLoad() {
    await this.page.waitForSelector('[data-testid="products-grid"], #products-grid', { timeout: 10000 });
    await this.page.waitForFunction(() => {
      const text = document.body.textContent;
      return text.includes("총") && text.includes("개");
    });
  }

  // 상품을 장바구니에 추가
  async addProductToCart(productName) {
    await this.page.click(
      `text=${productName} >> xpath=ancestor::*[contains(@class, 'product-card')] >> .add-to-cart-btn`,
    );
    await this.page.waitForSelector("text=장바구니에 추가되었습니다", {
      timeout: 5000,
    });
  }

  // 장바구니 모달 열기
  async openCartModal() {
    await this.page.click("#cart-icon-btn");
    await this.page.waitForSelector(".cart-modal-overlay", { timeout: 5000 });
  }

  async push(url) {
    await this.page.evaluate((url) => {
      window.history.pushState(null, "", url);
      window.dispatchEvent(new Event("popstate"));
    }, url);
  }
}

test.describe("E2E: 쇼핑몰 전체 사용자 시나리오", () => {
  test.beforeEach(async ({ page }) => {
    // 로컬 스토리지 초기화
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe("1. 애플리케이션 초기화 및 기본 기능", () => {
    test("페이지 접속 시 로딩 상태가 표시되고 상품 목록이 정상적으로 로드된다", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      console.log(page);
      // 로딩 상태 확인
      await expect(page.locator("text=카테고리 로딩 중...")).toBeVisible();

      // 상품 목록 로드 완료 대기
      await helpers.waitForPageLoad();

      // 상품 개수 확인 (340개)
      await expect(page.locator("text=340개")).toBeVisible();

      // 기본 UI 요소들 존재 확인
      await expect(page.locator("#search-input")).toBeVisible();
      await expect(page.locator("#cart-icon-btn")).toBeVisible();
      await expect(page.locator("#limit-select")).toBeVisible();
      await expect(page.locator("#sort-select")).toBeVisible();
    });

    test("상품 카드에 기본 정보가 올바르게 표시된다", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await helpers.waitForPageLoad();

      // 첫 번째 상품 카드 확인
      const firstProductCard = page.locator(".product-card").first();

      // 상품 이미지 존재 확인
      await expect(firstProductCard.locator("img")).toBeVisible();

      // 상품명 확인
      await expect(firstProductCard).toContainText(/pvc 투명 젤리 쇼핑백|고양이 난간 안전망/i);

      // 가격 정보 확인 (숫자 + 원)
      await expect(firstProductCard).toContainText(/\d{1,3}(,\d{3})*원/);

      // 장바구니 버튼 확인
      await expect(firstProductCard.locator(".add-to-cart-btn")).toBeVisible();
    });
  });

  test.describe("2. 검색 및 필터링 기능", () => {
    test("검색어 입력 후 Enter 키로 검색하고 URL이 업데이트된다", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await helpers.waitForPageLoad();

      // 검색어 입력
      await page.fill("#search-input", "젤리");
      await page.press("#search-input", "Enter");

      // URL 업데이트 확인
      await expect(page).toHaveURL(/search=%EC%A0%A4%EB%A6%AC/);

      // 검색 결과 확인
      await expect(page.locator("text=3개")).toBeVisible();

      // 검색어가 검색창에 유지되는지 확인
      await expect(page.locator("#search-input")).toHaveValue("젤리");

      // 검색어 입력
      await page.fill("#search-input", "아이패드");
      await page.press("#search-input", "Enter");

      // URL 업데이트 확인
      await expect(page).toHaveURL(/search=%EC%95%84%EC%9D%B4%ED%8C%A8%EB%93%9C/);

      // 검색 결과 확인
      await expect(page.locator("text=21개")).toBeVisible();

      // 새로고침을 해도 유지 되는지 확인
      await page.reload();
      await helpers.waitForPageLoad();
      await expect(page.locator("text=21개")).toBeVisible();
    });

    test("카테고리 선택 후 브레드크럼과 URL이 업데이트된다", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await helpers.waitForPageLoad();

      // 1차 카테고리 선택
      await page.click("text=생활/건강");

      await expect(page).toHaveURL(/category1=%EC%83%9D%ED%99%9C%2F%EA%B1%B4%EA%B0%95/);
      await expect(page.locator("text=300개")).toBeVisible();

      // 브레드크럼 확인
      await expect(page.locator("text=카테고리:").locator("..")).toContainText("생활/건강");

      // 2차 카테고리 선택
      await page.click("text=자동차용품");

      await expect(page).toHaveURL(/category2=%EC%9E%90%EB%8F%99%EC%B0%A8%EC%9A%A9%ED%92%88/);
      await expect(page.locator("text=11개")).toBeVisible();

      // 브레드크럼에 2차 카테고리도 표시되는지 확인
      await expect(page.locator("text=카테고리:").locator("..")).toContainText("자동차용품");
      await expect(page.locator("text=11개")).toBeVisible();

      await page.reload();
      await helpers.waitForPageLoad();
      await expect(page.locator("text=11개")).toBeVisible();
    });

    test("브레드크럼 클릭으로 상위 카테고리로 이동할 수 있다", async ({ page }) => {
      const helpers = new E2EHelpers(page);

      // 2차 카테고리 상태에서 시작
      await helpers.push("/?current=1&category1=생활%2F건강&category2=자동차용품&search=차량용");
      await helpers.waitForPageLoad();
      await expect(page.locator("text=9개")).toBeVisible();

      // 1차 카테고리 브레드크럼 클릭
      await page.click("text=생활/건강");

      await expect(page).toHaveURL(/category1=%EC%83%9D%ED%99%9C%2F%EA%B1%B4%EA%B0%95/);
      await expect(page).not.toHaveURL(/category2/);
      await expect(page.locator("text=12개")).toBeVisible();

      // 전체 브레드크럼 클릭
      await page.click("text=전체");
      await expect(page.locator("text=카테고리:전체생활/건강디지털/가전")).toBeVisible();

      await page.reload();
      await helpers.waitForPageLoad();
      await expect(page.locator("text=카테고리:전체생활/건강디지털/가전")).toBeVisible();

      await page.fill("#search-input", "");
      await page.press("#search-input", "Enter");

      await expect(page).not.toHaveURL(/category/);
      await expect(page.locator("text=340개")).toBeVisible();
    });

    test("정렬 옵션 변경 시 URL이 업데이트된다", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await helpers.waitForPageLoad();

      // 가격 높은순으로 정렬
      await page.selectOption("#sort-select", "price_desc");

      // 첫 번째 상품 이 가격 높은 순으로 정렬되었는지 확인
      await expect(page.locator(".product-card").first()).toMatchAriaSnapshot(`
    - img "ASUS ROG Flow Z13 GZ302EA-RU110W 64GB, 1TB"
    - heading "ASUS ROG Flow Z13 GZ302EA-RU110W 64GB, 1TB" [level=3]
    - paragraph: ASUS
    - paragraph: 3,749,000원
    - button "장바구니 담기"
      `);

      await page.selectOption("#sort-select", "name_asc");
      await expect(page.locator(".product-card").nth(1)).toMatchAriaSnapshot(`
    - img "[매일출발]유로블루플러스 차량용 요소수 국내산 Adblue 호스포함"
    - heading "[매일출발]유로블루플러스 차량용 요소수 국내산 Adblue 호스포함" [level=3]
    - paragraph: 유로블루플러스
    - paragraph: 8,700원
    - button "장바구니 담기"
    `);

      await page.selectOption("#sort-select", "name_desc");
      await expect(page.locator(".product-card").nth(1)).toMatchAriaSnapshot(`
    - img "P&amp;G 다우니 울트라 섬유유연제 에이프릴 프레쉬, 5.03L, 1개"
    - heading "P&amp;G 다우니 울트라 섬유유연제 에이프릴 프레쉬, 5.03L, 1개" [level=3]
    - paragraph: 다우니
    - paragraph: 16,610원
    - button "장바구니 담기"
      `);

      await page.reload();
      await helpers.waitForPageLoad();
      await expect(page.locator(".product-card").nth(1)).toMatchAriaSnapshot(`
    - img "P&amp;G 다우니 울트라 섬유유연제 에이프릴 프레쉬, 5.03L, 1개"
    - heading "P&amp;G 다우니 울트라 섬유유연제 에이프릴 프레쉬, 5.03L, 1개" [level=3]
    - paragraph: 다우니
    - paragraph: 16,610원
    - button "장바구니 담기"
      `);
    });

    test("페이지당 상품 수 변경 시 URL이 업데이트된다", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await helpers.waitForPageLoad();

      // 10개로 변경
      await page.selectOption("#limit-select", "10");
      await expect(page).toHaveURL(/limit=10/);
      await page.waitForFunction(() => {
        return document.querySelectorAll(".product-card").length === 10;
      });
      await expect(page.locator(".product-card").last()).toMatchAriaSnapshot(
        `- heading "탈부착 방충망 자석쫄대 방풍비닐 창문방충망 셀프시공 DIY 백색 100cm" [level=3]`,
      );

      await page.selectOption("#limit-select", "20");
      await expect(page).toHaveURL(/limit=20/);
      await page.waitForFunction(() => {
        return document.querySelectorAll(".product-card").length === 20;
      });
      await expect(page.locator(".product-card").last()).toMatchAriaSnapshot(
        `- heading "고양이 난간 안전망 복층 베란다 방묘창 방묘문 방충망 캣도어 일반형검정1mx1m" [level=3]`,
      );

      await page.selectOption("#limit-select", "50");
      await expect(page).toHaveURL(/limit=50/);
      await page.waitForFunction(() => {
        return document.querySelectorAll(".product-card").length === 50;
      });
      await expect(page.locator(".product-card").last()).toMatchAriaSnapshot(
        `- heading "강아지 고양이 아이스팩 파우치 여름 베개 젤리곰 M사이즈" [level=3]`,
      );

      await page.selectOption("#limit-select", "100");
      await expect(page).toHaveURL(/limit=100/);
      await page.waitForFunction(() => {
        return document.querySelectorAll(".product-card").length === 100;
      });
      await expect(page.locator(".product-card").last()).toMatchAriaSnapshot(
        `- heading "고양이 스크래쳐 숨숨집 하우스 대형 원목 스크레쳐 A type" [level=3]`,
      );

      await page.reload();
      await helpers.waitForPageLoad();
      await expect(page.locator(".product-card").last()).toMatchAriaSnapshot(
        `- heading "고양이 스크래쳐 숨숨집 하우스 대형 원목 스크레쳐 A type" [level=3]`,
      );
    });
  });

  test.describe("3. 상태 유지 및 URL 복원", () => {
    test("검색어와 필터 조건이 URL에서 복원된다", async ({ page }) => {
      const helpers = new E2EHelpers(page);

      // 복잡한 쿼리 파라미터로 직접 접근
      await helpers.push("/?search=젤리&category1=생활%2F건강&sort=price_desc&limit=10");
      await helpers.waitForPageLoad();

      await expect(page.locator("text=카테고리:").locator("..")).toContainText("생활/건강");
      await expect(page.locator("#search-input")).toHaveValue("젤리");
      await expect(page.locator("#sort-select")).toHaveValue("price_desc");
      await expect(page.locator("#limit-select")).toHaveValue("10");

      await expect(page.locator("text=3개")).toBeVisible();
    });

    test("장바구니 내용이 localStorage에 저장되고 복원된다", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await helpers.waitForPageLoad();

      // 상품을 장바구니에 추가
      await helpers.addProductToCart("PVC 투명 젤리 쇼핑백");

      // 장바구니 아이콘에 개수 표시 확인
      await expect(page.locator("#cart-icon-btn span")).toBeVisible();

      // localStorage에 저장되었는지 확인
      const cartData = await page.evaluate(() => localStorage.getItem("shopping_cart"));
      expect(cartData).toBeTruthy();

      // 페이지 새로고침
      await page.reload();
      await helpers.waitForPageLoad();

      // 장바구니 아이콘에 여전히 개수가 표시되는지 확인
      await expect(page.locator("#cart-icon-btn span")).toBeVisible();
    });

    test("장바구니 아이콘에 상품 개수가 정확히 표시된다", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await helpers.waitForPageLoad();

      // 초기에는 개수 표시가 없어야 함
      await expect(page.locator("#cart-icon-btn span")).not.toBeVisible();

      // 첫 번째 상품 추가
      await helpers.addProductToCart("PVC 투명 젤리 쇼핑백");
      await expect(page.locator("#cart-icon-btn span")).toHaveText("1");

      // 두 번째 상품 추가
      await helpers.addProductToCart("샷시 풍지판");
      await expect(page.locator("#cart-icon-btn span")).toHaveText("2");

      // 첫 번째 상품 한 번 더 추가
      await helpers.addProductToCart("PVC 투명 젤리 쇼핑백");
      await expect(page.locator("#cart-icon-btn span")).toHaveText("2");
    });
  });

  test.describe("4. 상품 상세 페이지 워크플로우", () => {
    test("상품 클릭부터 관련 상품 이동까지 전체 플로우", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await page.evaluate(() => {
        window.loadFlag = true;
      });
      await helpers.waitForPageLoad();

      // 상품 이미지 클릭하여 상세 페이지로 이동
      const productCard = page
        .locator("text=PVC 투명 젤리 쇼핑백")
        .locator('xpath=ancestor::*[contains(@class, "product-card")]');
      await productCard.locator("img").click();

      // URL이 상세 페이지로 변경되었는지 확인
      await expect(page).toHaveURL(/\/product\/\d+/);

      // 상세 페이지 로딩 확인
      await expect(page.locator("text=상품 상세")).toBeVisible();

      // h1 태그에 상품명 확인
      await expect(
        page.locator('h1:text("PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장")'),
      ).toBeVisible();

      // 수량 조절 후 장바구니 담기
      await page.click("#quantity-increase");
      await expect(page.locator("#quantity-input")).toHaveValue("2");

      await page.click("#add-to-cart-btn");
      await expect(page.locator("text=장바구니에 추가되었습니다")).toBeVisible();

      // 관련 상품 섹션 확인
      await expect(page.locator("text=관련 상품")).toBeVisible();

      const relatedProducts = page.locator(".related-product-card");
      await expect(relatedProducts.first()).toBeVisible();

      // 첫 번째 관련 상품 클릭
      const currentUrl = page.url();
      await relatedProducts.first().click();

      // 다른 상품의 상세 페이지로 이동했는지 확인
      await expect(page).toHaveURL(/\/product\/\d+/);
      await expect(page.url()).not.toBe(currentUrl);
      await expect(
        page.locator('h1:text("샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이")'),
      ).toBeVisible();

      await expect(await page.evaluate(() => window.loadFlag)).toBe(true);

      await page.reload();

      await expect(
        page.locator('h1:text("샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이")'),
      ).toBeVisible();

      await expect(await page.evaluate(() => window.loadFlag)).toBe(undefined);
    });
  });

  test.describe("5. 장바구니 완전한 워크플로우", () => {
    test("여러 상품 추가, 수량 조절, 선택 삭제 전체 시나리오", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await helpers.waitForPageLoad();

      // 첫 번째 상품 추가
      await helpers.addProductToCart("PVC 투명 젤리 쇼핑백");

      // 두 번째 상품 추가
      await helpers.addProductToCart("샷시 풍지판");

      // 장바구니 아이콘에 개수 표시 확인 (2개)
      await expect(page.locator("#cart-icon-btn span")).toHaveText("2");

      // 장바구니 모달 열기
      await helpers.openCartModal();

      // 두 상품이 모두 있는지 확인
      await expect(page.locator(".cart-modal")).toContainText("PVC 투명 젤리 쇼핑백");
      await expect(page.locator(".cart-modal")).toContainText("샷시 풍지판");

      // 첫 번째 상품 수량 증가
      await page.locator(".quantity-increase-btn").first().click();

      // 총 금액 업데이트 확인
      await expect(page.locator("#root")).toMatchAriaSnapshot(`
    - text: /총 금액 670원/
    - button "전체 비우기"
    - button "구매하기"
    `);

      // 첫 번째 상품만 선택
      await page.locator(".cart-item-checkbox").first().check();

      // 선택 삭제
      await page.click("#cart-modal-remove-selected-btn");

      // 첫 번째 상품만 삭제되고 두 번째 상품은 남아있는지 확인
      await expect(page.locator(".cart-modal")).not.toContainText("PVC 투명 젤리 쇼핑백");
      await expect(page.locator(".cart-modal")).toContainText("샷시 풍지판");

      // 장바구니 아이콘 개수 업데이트 확인 (1개)
      await expect(page.locator("#cart-icon-btn span")).toHaveText("1");
    });

    test("전체 선택 후 장바구니 비우기", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await helpers.waitForPageLoad();

      // 여러 상품 추가
      await helpers.addProductToCart("PVC 투명 젤리 쇼핑백");
      await helpers.addProductToCart("고양이 난간 안전망");

      // 장바구니 모달 열기
      await helpers.openCartModal();

      // 전체 선택
      await page.check("#cart-modal-select-all-checkbox");

      // 모든 상품이 선택되었는지 확인
      const checkboxes = page.locator(".cart-item-checkbox");
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }

      // 장바구니 비우기
      await page.click("#cart-modal-clear-cart-btn");

      // 장바구니가 비어있는지 확인
      await expect(page.locator("text=장바구니가 비어있습니다")).toBeVisible();

      // 장바구니 아이콘에서 개수 표시가 사라졌는지 확인
      await expect(page.locator("#cart-icon-btn span")).not.toBeVisible();
    });
  });

  test.describe("6. 무한 스크롤 기능", () => {
    test("페이지 하단 스크롤 시 추가 상품이 로드된다", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await helpers.waitForPageLoad();

      // 초기 상품 카드 수 확인
      const initialCards = await page.locator(".product-card").count();
      expect(initialCards).toBe(20);

      // 페이지 하단으로 스크롤
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // 로딩 인디케이터 확인
      await expect(page.locator("text=상품을 불러오는 중...")).toBeVisible();

      // 추가 상품 로드 대기
      await page.waitForFunction(
        () => {
          return document.querySelectorAll(".product-card").length > 20;
        },
        { timeout: 5000 },
      );

      // 상품 수가 증가했는지 확인
      const updatedCards = await page.locator(".product-card").count();
      expect(updatedCards).toBeGreaterThan(initialCards);
    });
  });

  test.describe("7. 모달 및 UI 인터랙션", () => {
    test("장바구니 모달이 다양한 방법으로 열리고 닫힌다", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await helpers.waitForPageLoad();

      // 모달 열기
      await page.click("#cart-icon-btn");
      await expect(page.locator(".cart-modal-overlay")).toBeVisible();

      // ESC 키로 닫기
      await page.keyboard.press("Escape");
      await expect(page.locator(".cart-modal-overlay")).not.toBeVisible();

      // 다시 열기
      await page.click("#cart-icon-btn");
      await expect(page.locator(".cart-modal-overlay")).toBeVisible();

      // X 버튼으로 닫기
      await page.click("#cart-modal-close-btn");
      await expect(page.locator(".cart-modal-overlay")).not.toBeVisible();

      // 다시 열기
      await page.click("#cart-icon-btn");
      await expect(page.locator(".cart-modal-overlay")).toBeVisible();

      // 배경 클릭으로 닫기 (모달 내용이 아닌 오버레이 영역 클릭)
      await page.locator(".cart-modal-overlay").click({ position: { x: 10, y: 10 } });
      await expect(page.locator(".cart-modal-overlay")).not.toBeVisible();
    });

    test("토스트 메시지 시스템이 올바르게 작동한다", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await helpers.waitForPageLoad();

      // 상품을 장바구니에 추가하여 토스트 메시지 트리거
      await helpers.addProductToCart("PVC 투명 젤리 쇼핑백");

      // 토스트 메시지 표시 확인
      await expect(page.locator("text=장바구니에 추가되었습니다")).toBeVisible();

      // 닫기 버튼이 있다면 클릭해서 수동으로 닫기 테스트
      const closeButton = page.locator(".toast-close-btn");
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await expect(page.locator("text=장바구니에 추가되었습니다")).not.toBeVisible();
      } else {
        // 자동으로 사라지는지 확인
        await expect(page.locator("text=장바구니에 추가되었습니다")).not.toBeVisible({ timeout: 4000 });
      }
    });
  });

  test.describe("8. SPA 네비게이션", () => {
    test("브라우저 뒤로가기/앞으로가기가 올바르게 작동한다", async ({ page }) => {
      const helpers = new E2EHelpers(page);
      await page.evaluate(() => {
        window.loadFlag = true;
      });
      await helpers.waitForPageLoad();

      // 상품 상세 페이지로 이동
      const productCard = page
        .locator("text=PVC 투명 젤리 쇼핑백")
        .locator('xpath=ancestor::*[contains(@class, "product-card")]');
      await productCard.locator("img").click();

      await expect(page).toHaveURL("/product/85067212996");
      await expect(
        page.locator('h1:text("PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장")'),
      ).toBeVisible();
      await expect(page.locator("text=관련 상품")).toBeVisible();
      const relatedProducts = page.locator(".related-product-card");
      await relatedProducts.first().click();

      await expect(page).toHaveURL("/product/86940857379");
      await expect(
        page.locator('h1:text("샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이")'),
      ).toBeVisible();

      // 브라우저 뒤로가기
      await page.goBack();
      await expect(page).toHaveURL("/product/85067212996");
      await expect(
        page.locator('h1:text("PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장")'),
      ).toBeVisible();

      // 브라우저 앞으로가기
      await page.goForward();
      await expect(page).toHaveURL("/product/86940857379");
      await expect(
        page.locator('h1:text("샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이")'),
      ).toBeVisible();

      await page.goBack();
      await page.goBack();
      await expect(page).toHaveURL("/");
      const firstProductCard = page.locator(".product-card").first();
      await expect(firstProductCard.locator("img")).toBeVisible();

      expect(await page.evaluate(() => window.loadFlag)).toBe(true);

      await page.reload();
      expect(
        await page.evaluate(() => {
          return window.loadFlag;
        }),
      ).toBe(undefined);
    });

    // 404 페이지 테스트
    test("존재하지 않는 페이지 접근 시 404 페이지가 표시된다", async ({ page }) => {
      // 존재하지 않는 경로로 이동
      await page.goto("/non-existent-page");

      // 404 페이지 확인
      await expect(page.getByRole("main")).toMatchAriaSnapshot(`
    - img "페이지를 찾을 수 없습니다"
    - link "홈으로":
      - /url: /
    `);
    });
  });
});
