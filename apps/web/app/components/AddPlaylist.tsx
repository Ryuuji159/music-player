import { useEffect, useState, type SubmitEventHandler } from "react";
import { Check, ChevronDown, ChevronRight, ListPlus, Loader2, Plus, Trash2 } from "lucide-react";
import { playlistAPI } from "~/api/playlist";
import { queueAPI } from "~/api/queue";
import type { PlaylistDetailDto, PlaylistDto } from "@skrd/contracts";

export const AddPlaylist = () => {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PlaylistDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);

  const load = () => {
    playlistAPI.list().then(setPlaylists).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const submit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      await playlistAPI.register(url);
      setUrl("");
      setStatus({ type: "success", message: "Playlist registrada" });
      load();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "No se pudo añadir" });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await playlistAPI.remove(id);
      if (expandedId === id) setExpandedId(null);
      if (detail?.id === id) setDetail(null);
      load();
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
    setSearch("");
    if (detail?.id === id) return;

    setDetailLoading(true);
    playlistAPI
      .get(id)
      .then(setDetail)
      .catch((err) => {
        console.error(err);
        setDetail(null);
      })
      .finally(() => setDetailLoading(false));
  };

  const addToQueue = async (videoId: string) => {
    try {
      await queueAPI.appendVideo(videoId);
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
          disabled={loading}
          className="flex cursor-pointer items-center justify-center gap-2 border-2 border-ink bg-accent px-4 py-2 font-bold uppercase tracking-wide text-accent-ink hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando
            </>
          ) : (
            "Añadir"
          )}
        </button>
      </form>

      {loading && (
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
                        {detailLoading ? (
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
