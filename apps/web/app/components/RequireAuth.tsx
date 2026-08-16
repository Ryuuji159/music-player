import type { ReactNode } from 'react';
import { Spinner } from '~/components/ui/spinner';
import { useAuth } from '~/hooks/useAuth';
import { LoginForm } from './LoginForm';

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-background">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!user) return <LoginForm />;

  return <>{children}</>;
};
