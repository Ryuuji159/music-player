import { useState, type SubmitEventHandler } from 'react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Spinner } from '~/components/ui/spinner';
import { toast } from '~/components/ui/toast';
import { useCreateRequest } from '~/hooks/useRequests';

export const RequestSongForm = () => {
  const [url, setUrl] = useState('');
  const createMutation = useCreateRequest();

  const submit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync(url);
      setUrl('');
      toast.add({
        type: 'success',
        title: 'Solicitud enviada',
        description: 'Tu canción sonará cuando el personal la apruebe.',
      });
    } catch (err) {
      toast.add({
        type: 'error',
        title: 'No se pudo enviar la solicitud',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Pega una URL de YouTube"
        className="min-w-0 flex-1"
      />
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? (
          <>
            <Spinner data-icon="inline-start" />
            Cargando
          </>
        ) : (
          'Solicitar'
        )}
      </Button>
    </form>
  );
};
