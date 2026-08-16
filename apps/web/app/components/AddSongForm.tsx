import { useState, type SubmitEventHandler } from 'react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Spinner } from '~/components/ui/spinner';
import { toast } from '~/components/ui/toast';
import { useAppendToQueue } from '~/hooks/useQueue';

export const AddSongForm = () => {
  const [url, setUrl] = useState('');
  const appendMutation = useAppendToQueue();

  const submit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      await appendMutation.mutateAsync(url);
      setUrl('');
      toast.add({ type: 'success', title: 'Canción añadida a la cola' });
    } catch (err) {
      toast.add({
        type: 'error',
        title: 'No se pudo añadir',
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
      <Button type="submit" disabled={appendMutation.isPending}>
        {appendMutation.isPending ? (
          <>
            <Spinner data-icon="inline-start" />
            Cargando
          </>
        ) : (
          'Añadir'
        )}
      </Button>
    </form>
  );
};
