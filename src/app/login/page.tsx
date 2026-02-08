import { LoginForm } from '@/components/auth/LoginForm';

// Force dynamic rendering to avoid SSG issues with React Query
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginForm />;
}

export const metadata = {
  title: 'Вход - LEADS CREATE',
  description: 'Страница входа в систему управления звонками',
};
