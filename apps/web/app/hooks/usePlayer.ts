import { useMutation } from "@tanstack/react-query";
import { playerAPI } from "~/api/player";

export function usePlayerActions() {
    const play = useMutation({ mutationFn: playerAPI.play });
    const pause = useMutation({ mutationFn: playerAPI.pause });
    const next = useMutation({ mutationFn: playerAPI.next });
    const previous = useMutation({ mutationFn: playerAPI.previous });
    const ended = useMutation({ mutationFn: playerAPI.ended });
    const error = useMutation({ mutationFn: playerAPI.error });
    const playItem = useMutation({ mutationFn: playerAPI.playItem });

    return { play, pause, next, previous, ended, error, playItem };
}
