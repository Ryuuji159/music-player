import { z } from "zod";
import { playlistDetailSchema, playlistListSchema, type PlaylistDetailDto, type PlaylistDto } from "@skrd/contracts";
import { request } from "./http";

export const playlistAPI = {
    list: (): Promise<PlaylistDto[]> => {
        return request("/playlist", playlistListSchema);
    },
    get: (id: string): Promise<PlaylistDetailDto> => {
        return request(`/playlist/${id}`, playlistDetailSchema);
    },
    register: (url: string) => {
        return request("/playlist", z.unknown(), { method: "POST", body: JSON.stringify({ url }) });
    },
    remove: (id: string) => {
        return request(`/playlist/${id}`, z.unknown(), { method: "DELETE" });
    },
};
