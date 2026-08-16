import { useState, type SubmitEventHandler } from "react";
import { Check, ChevronDown, ChevronRight, ListPlus, Loader2, Plus, Trash2 } from "lucide-react";
import { useAppendVideoToQueue } from "~/hooks/useQueue";
import { usePlaylist, usePlaylists, useRegisterPlaylist, useRemovePlaylist } from "~/hooks/usePlaylists";

export const AddPlaylist = () => {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);

  const playlistsQuery = usePlaylists();
  const detailQuery = usePlaylist(loadedId);
  const registerMutation = useRegisterPlaylist();
  const removeMutation = useRemovePlaylist();
  const appendMutation = useAppendVideoToQueue();

  const playlists = playlistsQuery.data ?? [];
  const detail = detailQuery.data;

  const submit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      await registerMutation.mutateAsync(url);
      setUrl("");
      setStatus({ type: "success", message: "Playlist registrada" });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "No se pudo añadir" });
    }
  };

  const remove = async (id: string) => {
    try {
      await removeMutation.mutateAsync(id);
      if (expandedId === id) setExpandedId(null);
      if (loadedId === id) setLoadedId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const toggle = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);
    setLoadedId(id);
    setSearch("");
  };

  const addToQueue = async (videoId: string) => {
    try {
      await appendMutation.mutateAsync(videoId);
      setAddedId(videoId);
      setTimeout(() => setAddedId((cur) => (cur === videoId ? null : cur)), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const searchQuery = search.trim().toLowerCase();
  const filteredItems = detail
    ? searchQuery
      ? detail.items.filter(
          (m) =>
            m.title.toLowerCase().includes(searchQuery) ||
            m.channelTitle.toLowerCase().includes(searchQuery)
        )
      : detail.items
    : [];

  return (
    <section className="flex flex-col gap-2 border-2 border-line p-4">
      <div className="flex items-center gap-2">
        <ListPlus className="h-4 w-4 text-ink-muted" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Agregar playlist</h2>
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Pega una URL de playlist de YouTube"
          className="min-w-0 flex-1 border-2 border-ink bg-surface-card px-3 py-2 text-ink outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="flex cursor-pointer items-center justify-center gap-2 border-2 border-ink bg-accent px-4 py-2 font-bold uppercase tracking-wide text-accent-ink hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando
            </>
          ) : (
            "Añadir"
          )}
        </button>
      </form>

      {registerMutation.isPending && (
        <p className="text-sm text-ink-muted">Importando canciones de la playlist, puede tardar unos segundos…</p>
      )}

      {status && (
        <p className={`text-sm ${status.type === "error" ? "text-red-500" : "text-green-600"}`}>
          {status.message}
        </p>
      )}

      {playlists.length > 0 && (
        <ul className="divide-y divide-line">
          {playlists.map((playlist) => {
            const isOpen = expandedId === playlist.id || detail?.id === playlist.id;

            return (
              <li key={playlist.id}>
                <button
                  onClick={() => toggle(playlist.id)}
                  className="flex w-full cursor-pointer items-center gap-3 py-2 text-left"
                >
                  {playlist.thumbnailUrl && (
                    <img src={playlist.thumbnailUrl} alt="" className="h-9 w-12 shrink-0 object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{playlist.title}</p>
                    <p className="text-sm text-ink-muted">{playlist.itemCount} canciones</p>
                  </div>
                  {expandedId === playlist.id ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />
                  )}
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
                    expandedId === playlist.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    {isOpen && (
                      <div className="pb-2">
                        <a
                          href={`https://www.youtube.com/playlist?list=${playlist.playlistId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mb-2 block truncate text-sm text-ink-muted underline hover:text-accent"
                        >
                          https://www.youtube.com/playlist?list={playlist.playlistId}
                        </a>
                        <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Buscar canción…"
                          className="mb-2 w-full border-2 border-ink bg-surface-card px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
                        />
                        {detailQuery.isLoading ? (
                          <p className="flex items-center gap-2 text-sm text-ink-muted">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando videos…
                          </p>
                        ) : detail ? (
                          filteredItems.length ? (
                            <ul className="max-h-96 divide-y divide-line overflow-y-auto border-2 border-line">
                              {filteredItems.map((media) => (
                                <li key={media.id} className="flex items-center gap-3 py-2 px-2">
                                  <img src={media.thumbnailUrl} alt="" className="h-12 w-20 shrink-0 object-cover" />
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
                          ) : (
                            <p className="text-sm text-ink-muted">No se encontraron canciones</p>
                          )
                        ) : (
                          <p className="text-sm text-ink-muted">No se pudieron cargar los videos</p>
                        )}

                        <button
                          onClick={() => remove(playlist.id)}
                          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 border-2 border-line px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted hover:border-red-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar playlist
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
