import { CdpClient } from "./CdpClient"
import { SessionManager } from "./SessionManager"
import EventQueue from "./EventQueue"
import { DestinationConfig, HclCdpConfig, SessionData, IdentityData, FullSessionData } from "./types"
import { GoogleAnalytics } from "./destinations/GoogleAnalytics"
import { Facebook } from "./destinations/Facebook"

declare global {
  interface Window {
    HclCdp: typeof HclCdp
  }
}
export class HclCdp {
  private static instance: HclCdp
  private cdpClient: CdpClient | null = null
  public static deviceId: string | null = null
  public sessionId: string | null = null
  private sessionManager: SessionManager | null = null
  private static config: HclCdpConfig = {
    writeKey: "",
    cdpEndpoint: "",
    inactivityTimeout: 30,
    enableDeviceSessionLogging: false,
    enableUserSessionLogging: false,
    enableUserLogoutLogging: false,
  }
  private static destinations: DestinationConfig[] = []

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  static async init(config: HclCdpConfig, callback?: (error: Error | null, sessionData?: SessionData) => void) {
    this.destinations = config.destinations || []

    for (const destination of this.destinations) {
      destination.instance = new destination.classRef()
      await destination.instance.init(destination.config)
    }

    if (!HclCdp.instance) {
      HclCdp.instance = new HclCdp()
    }

    this.config = {
      writeKey: config.writeKey,
      cdpEndpoint: config.cdpEndpoint,
      inactivityTimeout: config.inactivityTimeout || 30,
      enableDeviceSessionLogging: config.enableDeviceSessionLogging === true || config.enableSessionLogging === true, // Backward compatibility
      enableUserSessionLogging: config.enableUserSessionLogging === true,
      enableUserLogoutLogging: config.enableUserLogoutLogging === true,
      destinations: config.destinations || [],
    }

    // Initialize CDP client first
    HclCdp.instance.cdpClient = new CdpClient()
    await HclCdp.instance.cdpClient.init(config)

    try {
      // Initialize session manager BEFORE flushing queued events
      // This ensures session IDs are available when queued events are sent
      HclCdp.instance.sessionManager = new SessionManager(
        config,
        HclCdp.onDeviceSessionStart,
        HclCdp.onDeviceSessionEnd,
        HclCdp.onUserSessionStart,
        HclCdp.onUserSessionEnd,
      )

      // Flush queued events AFTER session manager is ready
      EventQueue.flushQueue(EventQueue.PAGE_QUEUE_KEY, HclCdp.instance.cdpClient.page.bind(HclCdp.instance.cdpClient))
      EventQueue.flushQueue(EventQueue.TRACK_QUEUE_KEY, HclCdp.instance.cdpClient.track.bind(HclCdp.instance.cdpClient))
      EventQueue.flushQueue(
        EventQueue.IDENTIFY_QUEUE_KEY,
        HclCdp.instance.cdpClient.identify.bind(HclCdp.instance.cdpClient),
      )

      // Attach the instance to the window object
      if (typeof window !== "undefined") {
        if (!window.HclCdp) {
          window.HclCdp = HclCdp
        } else {
          console.warn("window.HclCdp is already defined. Skipping attachment.")
        }
      }

      // Call the callback with the deviceId
      if (callback) {
        const identityData = HclCdp.getIdentityData()
        callback(null, {
          deviceId: identityData?.deviceId || null,
          deviceSessionId: HclCdp.getDeviceSessionId() || null,
          userSessionId: HclCdp.getUserSessionId() || null,
        })
      }
    } catch (error) {
      // Call the callback with the error
      console.log("Error initializing HCL CDP SDK:", error)
      if (callback) callback(error as Error)
    }
  }

  static onDeviceSessionStart = (deviceSessionId: string, userSessionId: string) => {
    if (this.config?.enableDeviceSessionLogging === true) {
      if (HclCdp.instance?.cdpClient) {
        HclCdp.instance.cdpClient.track("Device_Session_Start", deviceSessionId, userSessionId)
      } else {
        // Queue the device session start event
        EventQueue.addToQueue(EventQueue.TRACK_QUEUE_KEY, {
          deviceSessionId,
          userSessionId,
          eventName: "Device_Session_Start",
          properties: {},
          otherIds: {},
        })
      }
    }
  }

  static onDeviceSessionEnd = (deviceSessionId: string, userSessionId: string) => {
    if (this.config?.enableDeviceSessionLogging === true) {
      if (HclCdp.instance?.cdpClient) {
        HclCdp.instance.cdpClient.track("Device_Session_End", deviceSessionId, userSessionId)
      }
    }
  }

  static onUserSessionStart = (deviceSessionId: string, userSessionId: string) => {
    if (this.config?.enableUserSessionLogging === true) {
      if (HclCdp.instance?.cdpClient) {
        HclCdp.instance.cdpClient.track("User_Session_Start", deviceSessionId, userSessionId)
      } else {
        // Queue the user session start event
        EventQueue.addToQueue(EventQueue.TRACK_QUEUE_KEY, {
          deviceSessionId,
          userSessionId,
          eventName: "User_Session_Start",
          properties: {},
          otherIds: {},
        })
      }
    }
  }

  static onUserSessionEnd = (deviceSessionId: string, userSessionId: string) => {
    if (this.config?.enableUserSessionLogging === true) {
      if (HclCdp.instance?.cdpClient) {
        HclCdp.instance.cdpClient.track("User_Session_End", deviceSessionId, userSessionId)
      }
    }
  }

  static page = async (pageName: string, properties?: Record<string, any>, otherIds?: Record<string, any>) => {
    const payload = {
      deviceSessionId: this.getDeviceSessionId(),
      userSessionId: this.getUserSessionId(),
      pageName,
      properties: {
        ...properties,
        path: window.location.pathname,
        url: window.location.href,
        referrer: document.referrer,
        title: document.title,
        search: document.location.search,
      },
      otherIds,
    }

    this.destinations.forEach(destination => {
      destination.instance.page({ event: pageName, properties: payload.properties })
    })

    if (!HclCdp.instance || !HclCdp.instance.cdpClient) {
      // If the SDK is not initialized, queue the event
      console.log("adding to queue")
      EventQueue.addToQueue(EventQueue.PAGE_QUEUE_KEY, payload)
      return
    }

    const utmParams: Record<string, any> = this.parseUtmParameters(document.location.pathname)

    // If the SDK is initialized, send the event
    HclCdp.instance.cdpClient.page(
      pageName,
      this.getDeviceSessionId(),
      this.getUserSessionId(),
      payload.properties,
      utmParams,
      otherIds,
    )
  }

  static track = async (eventName: string, properties?: Record<string, any>, otherIds?: Record<string, any>) => {
    this.destinations.forEach(destination => {
      destination.instance.track({ event: eventName, properties })
    })
    const payload = {
      deviceSessionId: this.getDeviceSessionId(),
      userSessionId: this.getUserSessionId(),
      eventName,
      properties,
      otherIds,
    }
    if (!HclCdp.instance || !HclCdp.instance.cdpClient) {
      // If the SDK is not initialized, queue the event
      EventQueue.addToQueue(EventQueue.TRACK_QUEUE_KEY, payload)
      return
    }

    // If the SDK is initialized, send the event
    HclCdp.instance.cdpClient.track(eventName, this.getDeviceSessionId(), this.getUserSessionId(), properties, otherIds)
  }

  static identify = async (userId: string, properties?: Record<string, any>, otherIds?: Record<string, any>) => {
    this.destinations.forEach(destination => {
      destination.instance.identify({ properties })
    })
    const payload = {
      deviceSessionId: this.getDeviceSessionId(),
      userSessionId: this.getUserSessionId(),
      userId,
      properties,
      otherIds,
    }

    if (!HclCdp.instance || !HclCdp.instance.cdpClient) {
      // If the SDK is not initialized, queue the event
      EventQueue.addToQueue(EventQueue.IDENTIFY_QUEUE_KEY, payload)
      return
    }

    // If the SDK is initialized, send the event
    HclCdp.instance.cdpClient.identify(userId, this.getDeviceSessionId(), this.getUserSessionId(), properties, otherIds)
  }

  static login = async (userId: string, properties?: Record<string, any>, otherIds?: Record<string, any>) => {
    if (!HclCdp.instance?.cdpClient) {
      return
    }

    // Start a new user session for login
    if (HclCdp.instance.sessionManager) {
      HclCdp.instance.sessionManager.startNewUserSession()
    }

    // Use the login method from CdpClient which handles both identify and track
    HclCdp.instance.cdpClient.login(userId, this.getDeviceSessionId(), this.getUserSessionId(), properties, otherIds)
  }

  static getIdentityData(): IdentityData | null {
    if (!HclCdp.instance?.cdpClient) {
      return null
    }
    return HclCdp.instance.cdpClient.getIdentityData()
  }

  static getSessionData(): FullSessionData | null {
    return HclCdp.instance?.sessionManager?.getFullSessionData() || null
  }

  static getSessionId(): string | "" {
    return HclCdp.instance?.sessionManager?.getSessionId() || ""
  }

  static getDeviceSessionId(): string | "" {
    return HclCdp.instance?.sessionManager?.getDeviceSessionId() || ""
  }

  static getUserSessionId(): string | "" {
    return HclCdp.instance?.sessionManager?.getUserSessionId() || ""
  }

  static setDeviceSessionLogging(enabled: boolean): void {
    this.config.enableDeviceSessionLogging = enabled
    // Also update CdpClient config if it exists
    if (HclCdp.instance?.cdpClient) {
      HclCdp.instance.cdpClient.updateConfig({ enableDeviceSessionLogging: enabled })
    }
  }

  static setUserSessionLogging(enabled: boolean): void {
    this.config.enableUserSessionLogging = enabled
    // Also update CdpClient config if it exists
    if (HclCdp.instance?.cdpClient) {
      HclCdp.instance.cdpClient.updateConfig({ enableUserSessionLogging: enabled })
    }
  }

  static setSessionLogging(enabled: boolean): void {
    // Deprecated method - now sets device session logging for backward compatibility
    this.setDeviceSessionLogging(enabled)
  }

  static setUserLogoutLogging(enabled: boolean): void {
    this.config.enableUserLogoutLogging = enabled
    // Also update CdpClient config if it exists
    if (HclCdp.instance?.cdpClient) {
      HclCdp.instance.cdpClient.updateConfig({ enableUserLogoutLogging: enabled })
    }
  }

  static setInactivityTimeout(timeoutMinutes: number): void {
    this.config.inactivityTimeout = timeoutMinutes
    // Also update SessionManager if it exists
    if (HclCdp.instance?.sessionManager) {
      HclCdp.instance.sessionManager.updateTimeout(timeoutMinutes)
    }
    // Also update CdpClient config if it exists
    if (HclCdp.instance?.cdpClient) {
      HclCdp.instance.cdpClient.updateConfig({ inactivityTimeout: timeoutMinutes })
    }
  }

  static getConfig(): Readonly<HclCdpConfig> {
    return { ...this.config }
  }

  static logout = async () => {
    if (!HclCdp.instance?.cdpClient) {
      return
    }

    // First track the logout event if enabled and clear user data
    if (this.config.enableUserLogoutLogging) {
      HclCdp.instance.cdpClient.logout(this.getDeviceSessionId(), this.getUserSessionId())
    } else {
      // Even if logging is disabled, we still need to clear user data
      HclCdp.instance.cdpClient.logout(this.getDeviceSessionId(), this.getUserSessionId())
    }

    // Use the SessionManager logout method which handles callbacks
    if (HclCdp.instance.sessionManager) {
      HclCdp.instance.sessionManager.logout()
    }
  }

  private static parseUtmParameters = (path: string): Record<string, string> => {
    try {
      const utmRegex = /(?:\?|&)(utm_[^=]+)=(.*?)(?=&|$)/gi
      const utmParams: Record<string, string> = {}
      let match: RegExpExecArray | null

      // Loop through the URL and match UTM parameters using the regex
      while ((match = utmRegex.exec(document.URL)) !== null) {
        utmParams[match[1]] = match[2]
      }

      // Return the UTM parameters if found, otherwise undefined
      return utmParams
    } catch (e) {
      console.error("Error parsing UTM parameters:", e)
      return {}
    }
  }

  private static getCookie = (name: string): string => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() ?? ""
    }
    return ""
  }

  static refreshCommonCookies = (): void => {
    if (HclCdp.instance?.cdpClient) {
      HclCdp.instance.cdpClient.refreshCommonCookies()
    }
  }

  /**
   * Force flush all queued events.
   * This will attempt to send all queued page, track, and identify events immediately.
   * Useful for scenarios like page unload where you want to ensure events are sent.
   * Note: Only works if SDK is initialized. Queued events are automatically flushed on init.
   */
  static flushQueue = (): void => {
    if (!HclCdp.instance?.cdpClient) {
      console.warn("Cannot flush queue: SDK not initialized")
      return
    }

    try {
      EventQueue.flushQueue(EventQueue.PAGE_QUEUE_KEY, HclCdp.instance.cdpClient.page.bind(HclCdp.instance.cdpClient))
      EventQueue.flushQueue(EventQueue.TRACK_QUEUE_KEY, HclCdp.instance.cdpClient.track.bind(HclCdp.instance.cdpClient))
      EventQueue.flushQueue(
        EventQueue.IDENTIFY_QUEUE_KEY,
        HclCdp.instance.cdpClient.identify.bind(HclCdp.instance.cdpClient),
      )
      console.log("✅ Event queue flushed successfully")
    } catch (error) {
      console.error("❌ Error flushing event queue:", error)
    }
  }
}
