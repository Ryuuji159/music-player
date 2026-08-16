import { useState, type SubmitEventHandler } from 'react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { toast } from '~/components/ui/toast';
import { useLogin } from '~/hooks/useAuth';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  const submit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      await login.mutateAsync({ username, password });
    } catch (err) {
      toast.add({
        type: 'error',
        title: 'No se pudo iniciar sesión',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
              autoComplete="username"
            />
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Contraseña"
              autoComplete="current-password"
            />
            <Button type="submit" disabled={login.isPending}>
              {login.isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Entrando
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
