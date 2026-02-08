import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F3EE] dark:bg-[#111827]">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-[#FEC004] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Страница не найдена
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Запрашиваемая страница не существует или была удалена.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-[#FEC004] hover:bg-[#e6ac00] text-gray-900 font-medium rounded-lg transition-colors"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
