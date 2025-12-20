/**
 * 🍪 Утилиты для работы с приватными файлами в S3 с httpOnly cookies
 */

import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru/api/v1';

/**
 * Получить подписанный URL для одного файла
 * @param fileKey - ключ файла в S3 (например: "director/passport_doc/123.pdf") или полный URL
 * @param expiresIn - время жизни ссылки в секундах (по умолчанию 3600 = 1 час)
 * @returns Подписанный URL для доступа к файлу
 */
export async function getSignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
  if (!fileKey) {
    throw new Error('File key is required');
  }

  // Если fileKey уже является полным URL, возвращаем его как есть
  if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
    console.log('📎 File key is already a full URL, returning as is');
    return fileKey;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/files/download/${encodeURIComponent(fileKey)}`,
      {
        credentials: 'include', // 🍪 Отправляем httpOnly cookies
        headers: {
          'X-Use-Cookies': 'true',
        },
      }
    );

    if (!response.ok) {
      // Если бэкенд не доступен, используем старый публичный URL как fallback
      console.warn('⚠️ Backend not available, using fallback public URL');
      const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL || 'https://f7eead03-crmfiles.s3.timeweb.com';
      return `${s3BaseUrl}/${fileKey}`;
    }

    const result = await response.json();
    // API возвращает { success: true, data: { url: "...", cached: true/false } }
    return result.data?.url || result.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL, using fallback:', error);
    // Fallback к публичному URL если бэкенд недоступен
    const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL || 'https://f7eead03-crmfiles.s3.timeweb.com';
    return `${s3BaseUrl}/${fileKey}`;
  }
}

/**
 * Получить подписанные URL для нескольких файлов
 * @param fileKeys - массив ключей файлов в S3
 * @param expiresIn - время жизни ссылки в секундах
 * @returns Объект с ключами и подписанными URL
 */
export async function getSignedUrls(
  fileKeys: string[], 
  expiresIn: number = 3600
): Promise<Record<string, string>> {
  if (!fileKeys || fileKeys.length === 0) {
    return {};
  }

  try {
    // Получаем URL для каждого файла параллельно
    const urlPromises = fileKeys.map(async (key) => {
      const url = await getSignedUrl(key, expiresIn);
      return { key, url };
    });

    const results = await Promise.all(urlPromises);
    
    // Преобразуем массив в объект
    return results.reduce((acc, { key, url }) => {
      acc[key] = url;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error('Error getting signed URLs:', error);
    return {};
  }
}

/**
 * Хук для загрузки подписанного URL файла
 * @param fileKey - ключ файла в S3 или полный URL
 * @param expiresIn - время жизни ссылки
 * @returns URL файла или null
 */
export function useFileUrl(fileKey: string | null | undefined, expiresIn: number = 3600) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!fileKey) {
      setUrl(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    getSignedUrl(fileKey, expiresIn)
      .then(signedUrl => {
        if (mounted) {
          setUrl(signedUrl);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [fileKey, expiresIn]);

  return { url, loading, error };
}

/**
 * Хук для загрузки подписанных URL для массива файлов
 * @param fileKeys - массив ключей файлов в S3 или полных URL
 * @param expiresIn - время жизни ссылки
 * @returns Объект с URL файлов (key -> url) и состояние загрузки
 */
export function useFileUrls(fileKeys: string[], expiresIn: number = 3600) {
  const [url, setUrl] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!fileKeys || fileKeys.length === 0) {
      setUrl({});
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    getSignedUrls(fileKeys, expiresIn)
      .then(signedUrls => {
        if (mounted) {
          setUrl(signedUrls);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [JSON.stringify(fileKeys), expiresIn]);

  return { url, loading, error };
}

