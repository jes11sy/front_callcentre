import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Проверяет, нужно ли показывать ошибку пользователю
 * SESSION_EXPIRED не показываем, так как уже идет редирект на логин
 */
export function shouldShowError(error: any): boolean {
  if (error?.message === 'SESSION_EXPIRED' || error?.isSessionExpired) {
    return false
  }
  return true
}

/**
 * Получает сообщение об ошибке для показа пользователю
 * Возвращает null если ошибку показывать не нужно
 */
export function getErrorMessage(error: any, defaultMessage: string = 'Произошла ошибка'): string | null {
  if (!shouldShowError(error)) {
    return null
  }
  
  if (error?.message) {
    return error.message
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  return defaultMessage
}
