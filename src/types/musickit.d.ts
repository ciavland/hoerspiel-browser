// Basic types for MusicKit JS
// This is a simplification. For full types, consider a library or copying the full definition.

declare namespace MusicKit {
    interface MusicKitInstance {
        api: {
            music: (path: string, params?: Record<string, any>) => Promise<any>;
        };
        authorize: () => Promise<string>;
        unauthorize: () => Promise<void>;
        player: {
            play: () => Promise<void>;
            pause: () => Promise<void>;
            stop: () => Promise<void>;
            queue: {
                append: (item: any) => Promise<void>;
            };
            nowPlayingItem: any;
            isPlaying: boolean;
        };
    }

    interface Config {
        developerToken: string;
        app: {
            name: string;
            build: string;
        };
    }

    interface MusicKitGlobal {
        configure: (config: Config) => MusicKitInstance;
        getInstance: () => MusicKitInstance;
    }
}

declare global {
    interface Window {
        MusicKit: MusicKit.MusicKitGlobal;
    }
}
