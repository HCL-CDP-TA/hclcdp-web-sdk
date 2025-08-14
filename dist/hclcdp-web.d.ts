/**
 * CDP Configuration
 */
interface HclCdpConfig {
    /**
     * The write key to use for the CDP source. (Required)
     */
    writeKey: string;
    /**
     * The endpoint to use for the CDP instance. (Required)
     */
    cdpEndpoint: string;
    /**
     * Default session timeout. Defaults to 30 minutes. (Optional)
     */
    inactivityTimeout?: number;
    /**
     * Send track events for session start and end events. Defaults to false. (Optional)
     */
    enableSessionLogging?: boolean;
    /**
     * Send track events for User Login and Logout Events. (Optional)
     */
    enableUserLogoutLogging?: boolean;
    /**
     * Destinations (Optional)
     */
    destinations?: DestinationConfig[];
}
interface SessionData {
    sessionId: string | null;
    deviceId: string | null;
}
interface IdentityData {
    profileId: string;
    deviceId: string;
    userId: string;
}
interface DestinationConfig {
    id: string;
    classRef: CdpDestinationConstructor;
    config: Record<string, string>;
    instance?: any;
}
interface CdpDestinationHandler {
    init(config: Record<string, string>): Promise<void>;
    track(event: {
        event: string;
        properties?: Record<string, any>;
    }): void;
    page(event: {
        event: string;
        properties?: Record<string, any>;
    }): void;
    identify(event: {
        properties?: Record<string, any>;
    }): void;
}
interface CdpDestinationConstructor {
    new (): CdpDestinationHandler;
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
    private static destinations;
    private constructor();
    static init(config: HclCdpConfig, callback?: (error: Error | null, sessionData?: SessionData) => void): Promise<void>;
    static onSessionStart: (sessionId: string) => void;
    static onSessionEnd: (sessionId: string) => void;
    static page: (pageName: string, properties?: Record<string, any>, otherIds?: Record<string, any>) => Promise<void>;
    static track: (eventName: string, properties?: Record<string, any>, otherIds?: Record<string, any>) => Promise<void>;
    static identify: (userId: string, properties?: Record<string, any>, otherIds?: Record<string, any>) => Promise<void>;
    static getDeviceId(): string | "";
    static getProfileId(): string | "";
    static getUserId(): string | "";
    static getIdentityData(): IdentityData | null;
    static getSessionId(): string | "";
    static logout: () => Promise<void>;
    private static parseUtmParameters;
    private static getCookie;
}

declare global {
    interface Window {
        fbq: ((...args: any[]) => void) & {
            push?: (...args: any[]) => void;
        };
        _fbq?: (...args: any[]) => void;
    }
}
declare class Facebook implements CdpDestinationHandler {
    private facebookPixelId;
    init(config: Record<string, string>): Promise<void>;
    track(event: {
        event: string;
        properties?: Record<string, any>;
    }): void;
    page(event: {
        event: string;
        properties?: Record<string, any>;
    }): void;
    identify(event: {
        properties?: Record<string, any>;
    }): void;
}

declare class GoogleAnalytics implements CdpDestinationHandler {
    init(config: Record<string, string>): Promise<void>;
    track(event: {
        event: string;
        properties?: Record<string, any>;
    }): void;
    page(event: {
        event: string;
        properties?: Record<string, any>;
    }): void;
    identify(event: {
        properties?: Record<string, any>;
    }): void;
}

export { Facebook, GoogleAnalytics, HclCdp, type HclCdpConfig, type IdentityData };
