import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { inviteAPI } from '~/api/invite';
import { Spinner } from '~/components/ui/spinner';

export default function Join() {
  const { token } = useParams();
  const navigate = useNavigate();
  const startedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current || !token) return;
    startedRef.current = true;

    inviteAPI
      .join(token)
      .then((res) => navigate(`/${res.venueSlug}`, { replace: true }))
      .catch(() => setError('QR no válido o expirado'));
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4 text-foreground">
      {error ? (
        <p className="text-center text-sm text-muted-foreground">
          {error}. Pide al personal que refresque el QR.
        </p>
      ) : (
        <Spinner className="size-6" />
      )}
    </div>
  );
}
