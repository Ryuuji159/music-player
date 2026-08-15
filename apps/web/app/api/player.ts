import { z } from "zod";
import { request } from "./http";

export const playerAPI = {
    next: () => {
        return request("/player/next", z.unknown(), { method: "POST" });
    },
    previous: () => {
        return request("/player/previous", z.unknown(), { method: "POST" });
    },
    play: () => {
        return request("/player/play", z.unknown(), { method: "POST" });
    },
    pause: () => {
        return request("/player/pause", z.unknown(), { method: "POST" });
    },
    ended: () => {
        return request("/player/events/ended", z.unknown(), { method: "POST" });
    },
    playItem: (id: string) => {
        return request(`/player/item/${id}/play`, z.unknown(), { method: "POST" });
    },
};