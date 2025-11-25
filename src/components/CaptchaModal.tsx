'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CaptchaRequest {
  id: string;
  accountId: number;
  image: string; // base64
  timestamp: string;
}

export default function CaptchaModal() {
  const [captcha, setCaptcha] = useState<CaptchaRequest | null>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Проверяем наличие капчи каждые 3 секунды
  useEffect(() => {
    const checkForCaptcha = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parser/captcha/pending`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Берем первую капчу из очереди
          setCaptcha(data.data[0]);
        }
      } catch (error) {
        console.error('Failed to check for captcha:', error);
      }
    };

    const interval = setInterval(checkForCaptcha, 3000);
    checkForCaptcha(); // Сразу проверяем

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captcha || !answer.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parser/captcha/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          captchaId: captcha.id,
          answer: answer.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Успешно отправили
        setCaptcha(null);
        setAnswer('');
      } else {
        alert('Ошибка отправки капчи: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to submit captcha:', error);
      alert('Ошибка отправки капчи');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCaptcha(null);
    setAnswer('');
  };

  if (!captcha) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            🔐 Требуется решить капчу
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Аккаунт Avito #{captcha.accountId} требует решения капчи
          </p>
          <p className="text-xs text-gray-500">
            Время запроса: {new Date(captcha.timestamp).toLocaleString('ru-RU')}
          </p>
        </div>

        {/* Изображение капчи */}
        <div className="mb-6 bg-gray-100 rounded-lg p-4 flex items-center justify-center">
          <img
            src={`data:image/png;base64,${captcha.image}`}
            alt="Captcha"
            className="max-w-full h-auto rounded"
          />
        </div>

        {/* Форма ввода */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="captcha-answer" className="block text-sm font-medium text-gray-700 mb-2">
              Введите текст с изображения:
            </label>
            <input
              id="captcha-answer"
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите капчу"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !answer.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ Капча должна быть решена в течение 5 минут, иначе операция будет отменена
          </p>
        </div>
      </div>
    </div>
  );
}

