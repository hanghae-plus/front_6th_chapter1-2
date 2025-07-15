import { PublicImage } from "./PublicImage";

export const ErrorContent = ({ error }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-500 mb-4">
        <PublicImage src="/error-large-icon.svg" alt="오류" className="mx-auto h-12 w-12" />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">상품을 찾을 수 없습니다</h1>
      <p className="text-gray-600 mb-4">{error || "요청하신 상품이 존재하지 않습니다."}</p>
      <button
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2"
      >
        이전 페이지
      </button>
      <a href="/" data-link="/" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
        홈으로
      </a>
    </div>
  </div>
);
