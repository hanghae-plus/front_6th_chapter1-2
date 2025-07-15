import { searchProducts, setCategory, setLimit, setSort } from "../services/index.js";
import { PublicImage } from "./PublicImage";

/**
 * 검색 및 필터 컴포넌트
 */
const OPTION_LIMITS = [10, 20, 50, 100];
const OPTION_SORTS = [
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
  { value: "name_asc", label: "이름순" },
  { value: "name_desc", label: "이름 역순" },
];

// 검색 입력 (Enter 키)
const handleSearchKeyDown = async (e) => {
  if (e.key === "Enter") {
    const query = e.target.value.trim();
    try {
      await searchProducts(query);
    } catch (error) {
      console.error("검색 실패:", error);
    }
  }
};

// 페이지당 상품 수 변경
const handleLimitChange = async (e) => {
  const limit = parseInt(e.target.value);
  try {
    await setLimit(limit);
  } catch (error) {
    console.error("상품 수 변경 실패:", error);
  }
};

// 정렬 변경
const handleSortChange = async (e) => {
  const sort = e.target.value;

  try {
    await setSort(sort);
  } catch (error) {
    console.error("정렬 변경 실패:", error);
  }
};

// 브레드크럼 카테고리 네비게이션
const handleBreadCrumbClick = async (e) => {
  const breadcrumbType = e.target.getAttribute("data-breadcrumb");

  try {
    if (breadcrumbType === "reset") {
      // "전체" 클릭 -> 카테고리 초기화
      await setCategory({
        category1: "",
        category2: "",
      });
    } else if (breadcrumbType === "category1") {
      // 1depth 클릭 -> 2depth 제거하고 1depth만 유지
      const category1 = e.target.getAttribute("data-category1");
      await setCategory({
        category1,
        category2: "",
      });
    }
  } catch (error) {
    console.error("브레드크럼 네비게이션 실패:", error);
  }
};

// 1depth 카테고리 선택
const handleMainCategoryClick = async (e) => {
  const category1 = e.target.getAttribute("data-category1");
  if (!category1) return;

  try {
    await setCategory({
      category1,
      category2: "",
    });
  } catch (error) {
    console.error("1depth 카테고리 선택 실패:", error);
  }
};

const handleSubCategoryClick = async (e) => {
  const category1 = e.target.getAttribute("data-category1");
  const category2 = e.target.getAttribute("data-category2");
  if (!category1 || !category2) return;

  try {
    await setCategory({
      category1,
      category2,
    });
  } catch (error) {
    console.error("2depth 카테고리 선택 실패:", error);
  }
};

export function SearchBar({ searchQuery = "", limit = 20, sort = "price_asc", category = {}, categories = {} }) {
  const categoryList = Object.keys(categories).length > 0 ? Object.keys(categories) : [];
  const limitOptions = OPTION_LIMITS.map((value) => (
    <option key={value} value={value} selected={Number(limit) === value}>
      {value}개
    </option>
  ));
  const sortOptions = OPTION_SORTS.map(({ value, label }) => (
    <option key={value} value={value} selected={sort === value}>
      {label}
    </option>
  ));

  const categoryButtons = categoryList.map((categoryKey) => (
    <button
      key={categoryKey}
      data-category1={categoryKey}
      className="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
      onClick={handleMainCategoryClick}
    >
      {categoryKey}
    </button>
  ));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      {/* 검색창 */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            id="search-input"
            placeholder="상품명을 검색해보세요..."
            value={searchQuery}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyDown={handleSearchKeyDown}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <PublicImage src="/search-icon.svg" alt="검색" className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* 필터 옵션 */}
      <div className="space-y-3">
        {/* 카테고리 필터 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">카테고리:</label>
            {["전체", category.category1, category.category2]
              .filter((cat, index) => index === 0 || Boolean(cat))
              .map((cat, index) => {
                if (cat === "전체") {
                  return (
                    <button
                      key="reset"
                      data-breadcrumb="reset"
                      className="text-xs hover:text-blue-800 hover:underline"
                      onClick={handleBreadCrumbClick}
                    >
                      전체
                    </button>
                  );
                } else if (index === 1) {
                  return (
                    <button
                      key={cat}
                      data-breadcrumb="category1"
                      data-category1={cat}
                      className="text-xs hover:text-blue-800 hover:underline"
                      onClick={handleBreadCrumbClick}
                    >
                      {cat}
                    </button>
                  );
                } else if (index === 2) {
                  return (
                    <span key={cat} className="text-xs text-gray-600 cursor-default">
                      {cat}
                    </span>
                  );
                }
              })
              .reduce((acc, item, index) => {
                if (index > 0) {
                  acc.push(<span className="text-xs text-gray-500">&gt;</span>);
                }
                acc.push(item);
                return acc;
              }, [])}
          </div>

          {/* 1depth 카테고리 */}
          {!category.category1 && (
            <div className="flex flex-wrap gap-2">
              {categoryList.length > 0 ? (
                categoryButtons
              ) : (
                <div className="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
              )}
            </div>
          )}

          {/* 2depth 카테고리 */}
          {category.category1 && categories[category.category1] && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {Object.keys(categories[category.category1]).map((category2) => {
                  const isSelected = category.category2 === category2;
                  return (
                    <button
                      key={category2}
                      data-category1={category.category1}
                      data-category2={category2}
                      className={`category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                               ${
                                 isSelected
                                   ? "bg-blue-100 border-blue-300 text-blue-800"
                                   : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                               }`}
                      onClick={handleSubCategoryClick}
                    >
                      {category2}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 기존 필터들 */}
        <div className="flex gap-2 items-center justify-between">
          {/* 페이지당 상품 수 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">개수:</label>
            <select
              id="limit-select"
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleLimitChange}
            >
              {limitOptions}
            </select>
          </div>

          {/* 정렬 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">정렬:</label>
            <select
              id="sort-select"
              className="text-sm border border-gray-300 rounded px-2 py-1
                           focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleSortChange}
            >
              {sortOptions}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
