declare namespace YT {
    const PlayerState: {
        UNSTARTED: -1;
        ENDED: 0,
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5
    };

    type PlayerEvent = {
        target: Player;
        data?: number;
    }

    type PlayerOptions = {
        videoId?: string;
        playerVars?: Record<string, number | string>,
        width?: string;
        height?: string;
        events?: {
            onReady?: (event: PlayerEvent) => void;
            onStateChange?: (event: PlayerEvent) => void;
            onError?: (event: PlayerEvent) => void;
            onAutoplayBlocked?: () => void;
        };
    };

    class Player {
        constructor(element: HTMLElement, options: PlayerOptions);
        destroy(): void;
        cueVideoById(videoId: string): void;
        loadVideoById(videoId: string): void;
        playVideo(): void;
        pauseVideo(): void;
        stopVideo(): void;
    }
}

interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
}