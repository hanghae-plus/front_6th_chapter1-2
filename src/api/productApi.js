// 상품 목록 조회
export async function getProducts(params = {}) {
  const { limit = 20, search = "", category1 = "", category2 = "", sort = "price_asc" } = params;
  const page = params.current ?? params.page ?? 1;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(category1 && { category1 }),
    ...(category2 && { category2 }),
    sort,
  });

  const response = await fetch(`/api/products?${searchParams}`);

  return await response.json();
}

// 상품 상세 조회
export async function getProduct(productId) {
  const response = await fetch(`/api/products/${productId}`);
  return await response.json();
}

// 카테고리 목록 조회
export async function getCategories() {
  // 테스트에서 로딩 상태를 확인하기 위한 인위적 지연
  await new Promise((resolve) => setTimeout(resolve, 200));
  const response = await fetch("/api/categories");
  return await response.json();
}
