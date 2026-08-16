import { useEffect, useState } from "react";
import { Check, Library, Loader2, Plus, Search } from "lucide-react";
import { useMediaSearch } from "~/hooks/useMedia";
import { useAppendVideoToQueue } from "~/hooks/useQueue";

export const MediaLibrary = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const appendMutation = useAppendVideoToQueue();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const searchQuery = useMediaSearch(debouncedQuery);
  const results = searchQuery.data ?? [];

  const addToQueue = async (videoId: string) => {
    try {
      await appendMutation.mutateAsync(videoId);
      setAddedId(videoId);
      setTimeout(() => setAddedId((cur) => (cur === videoId ? null : cur)), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="flex flex-col gap-2 border-2 border-line p-4">
      <div className="flex items-center gap-2">
        <Library className="h-4 w-4 text-ink-muted" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Biblioteca</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar canción registrada…"
          className="w-full border-2 border-ink bg-surface-card py-2 pl-9 pr-3 text-ink outline-none focus:border-accent"
        />
      </div>

      {searchQuery.isFetching && (
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Buscando…
        </p>
      )}

      {!searchQuery.isFetching && debouncedQuery.length > 0 && results.length === 0 && (
        <p className="text-sm text-ink-muted">Sin resultados</p>
      )}

      {results.length > 0 && (
        <ul className="max-h-64 divide-y divide-line overflow-y-auto border-2 border-line">
          {results.map((media) => (
            <li key={media.id} className="flex items-center gap-3 py-2 px-2">
              <img src={media.thumbnailUrl} alt="" className="h-9 w-12 shrink-0 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{media.title}</p>
                <p className="truncate text-xs text-ink-muted">{media.channelTitle}</p>
              </div>
              <button
                onClick={() => addToQueue(media.videoId)}
                className="shrink-0 cursor-pointer text-ink-muted hover:text-ink"
                aria-label="Añadir a la cola"
              >
                {addedId === media.videoId ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
