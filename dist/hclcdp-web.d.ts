interface HclCdpConfig {
    writeKey: string;
    cdpEndpoint: string;
    inactivityTimeout?: number;
    enableSessionLogging?: boolean;
    enableUserLogoutLogging?: boolean;
}
interface SessionData {
    sessionId: string | null;
    deviceId: string | null;
}

declare global {
    interface Window {
        HclCdp: typeof HclCdp;
    }
}
declare class HclCdp {
    private static instance;
    private cdpClient;
    static deviceId: string | null;
    sessionId: string | null;
    private sessionManager;
    private static config;
    private constructor();
    static init(config: HclCdpConfig, callback?: (error: Error | null, sessionData?: SessionData) => void): Promise<void>;
    static onSessionStart: (sessionId: string) => void;
    static onSessionEnd: (sessionId: string) => void;
    static page: (pageName: string, properties?: Record<string, any>, otherIds?: Record<string, any>) => Promise<void>;
    static track: (eventName: string, properties?: Record<string, any>, otherIds?: Record<string, any>) => Promise<void>;
    static identify: (userId: string, properties?: Record<string, any>, otherIds?: Record<string, any>) => Promise<void>;
    static getDeviceId(): string | "";
    static getSessionId(): string | "";
    static logout: () => Promise<void>;
}

export { HclCdp, type HclCdpConfig };
