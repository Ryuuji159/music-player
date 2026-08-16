import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Spinner } from '~/components/ui/spinner';
import { useAuth, userHome } from '~/hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    navigate(user ? userHome(user) : '/admin', { replace: true });
  }, [isLoading, user, navigate]);

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background">
      <Spinner className="size-6" />
    </div>
  );
}
