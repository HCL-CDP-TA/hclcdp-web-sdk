import { v4 as uuidv4 } from "uuid"
import packageJson from "../package.json" assert { type: "json" }
import { IResult, UAParser } from "ua-parser-js"
import { HclCdpConfig, IdentityData } from "./types"
import type { EventContext, EventPayload } from "./types"

interface SafariWindow extends Window {
  safari?: {
    pushNotification?: {
      toString: () => string
    }
  }
}

export class CdpClient {
  public profileId: string // Persistent per person/profile - never null after construction
  public deviceId: string // Persistent per device - never null after construction
  public userId: string | null = null // Only set when user identifies themselves
  private context: EventContext | null = null
  private commonIds: Record<string, string> = {} // Common tracking cookies like _ga, _fbp, etc.
  private config: HclCdpConfig = {
    writeKey: "",
    cdpEndpoint: "",
    inactivityTimeout: 30,
    enableDeviceSessionLogging: false,
    enableUserSessionLogging: false,
    enableUserLogoutLogging: false,
  }

  private readonly CDP_STORAGE_KEY = "hclcdp_identity_data"
  private readonly SESSION_ID = "hclcdp_session_id"

  constructor() {
    console.log("📦 SDK Version:", packageJson.version)

    // Load all identity data from single localStorage object
    const identityData = this.getStoredIdentityData()

    // Profile ID - persistent across sessions for the same person/profile
    if (identityData.profileId) {
      this.profileId = identityData.profileId
      console.log("🔄 Profile ID loaded from storage:", this.profileId)
    } else {
      this.profileId = this.createProfileId()
      console.log("✨ New Profile ID created:", this.profileId)
    }

    // Device ID - persistent per device, different from profile ID
    if (identityData.deviceId) {
      this.deviceId = identityData.deviceId
      console.log("🔄 Device ID loaded from storage:", this.deviceId)
    } else {
      this.deviceId = this.createDeviceId()
      console.log("✨ New Device ID created:", this.deviceId)
    }

    // User ID - only set when user identifies themselves
    this.userId = identityData.userId || null
    if (this.userId) {
      console.log("🔄 User ID loaded from storage:", this.userId)
    } else {
      console.log("👤 No User ID set (anonymous user)")
    }

    // Save the identity data back to localStorage
    this.saveIdentityData()
  }

  public init = async (config: HclCdpConfig): Promise<void> => {
    this.config = config
    console.log("CDP Initialisation initiated with config:", config)
    const agent: IResult = UAParser(window.navigator.userAgent)

    // Initialize base context (session will be added per event)
    this.context = {
      library: {
        name: packageJson.name,
        type: "javascript",
        version: packageJson.version,
      },
      userAgent: {
        deviceType: agent.device.type || "Desktop",
        osType: agent.os.name || "",
        osVersion: agent.os.version || "",
        browser: agent.browser.name || "",
        ua: agent.ua,
      },
      // session will be added when creating events
      session: {
        deviceSessionId: "",
        userSessionId: "",
      },
    }

    // Collect common tracking cookies and store them
    this.collectCommonCookies()

    // Always attempt to capture geolocation if browser permission is already granted
    // NOTE: Location is captured once at initialization and cached for all events.
    // This may be changed in future versions to support dynamic location updates.
    // SDK will never prompt for permission - only uses location if already granted.
    await this.captureGeolocation()
  }

  public updateConfig(configUpdates: Partial<HclCdpConfig>): void {
    this.config = { ...this.config, ...configUpdates }
  }

  public page = async (
    pageName: string,
    deviceSessionId: string,
    userSessionId: string,
    properties?: Record<string, any>,
    utmParams?: Record<string, any>,
    otherIds?: Record<string, any>,
  ): Promise<void> => {
    // Only set utm if there are actual UTM parameters, otherwise remove it
    if (this.context) {
      if (utmParams && Object.keys(utmParams).length > 0) {
        this.context.utm = utmParams
      } else {
        delete this.context.utm
      }
    }

    const contextWithSession: EventContext = this.context
      ? {
          ...this.context,
          session: {
            deviceSessionId,
            userSessionId,
          },
        }
      : {
          library: { name: "", type: "" },
          userAgent: { deviceType: "", osType: "", osVersion: "", browser: "", ua: "" },
          session: {
            deviceSessionId,
            userSessionId,
          },
        }

    const payload: EventPayload = {
      type: "page",
      event: "page_view",
      name: pageName,
      id: this.profileId, // Profile ID as main identifier
      deviceId: this.deviceId,
      userId: this.userId || "",
      originalTimestamp: Date.now(),
      messageId: uuidv4(),
      writeKey: this.config.writeKey || "",
      otherIds: this.mergeOtherIds(otherIds),
      context: contextWithSession,
      properties: {
        ...properties,
      },
    }

    this.sendPayload(payload)
  }

  public track = async (
    eventName: string,
    deviceSessionId: string,
    userSessionId: string,
    properties?: Record<string, any>,
    otherIds?: Record<string, any>,
  ): Promise<void> => {
    if (this.context) {
      this.context.page = {
        path: window.location.pathname,
        url: window.location.href,
        referrer: document.referrer,
        title: document.title,
        search: document.location.search,
      }
    }

    const contextWithSession: EventContext = this.context
      ? {
          ...this.context,
          session: {
            deviceSessionId,
            userSessionId,
          },
        }
      : {
          library: { name: "", type: "" },
          userAgent: { deviceType: "", osType: "", osVersion: "", browser: "", ua: "" },
          session: {
            deviceSessionId,
            userSessionId,
          },
        }

    const payload: EventPayload = {
      type: "track",
      event: eventName,
      id: this.profileId, // Profile ID as main identifier
      deviceId: this.deviceId,
      userId: this.userId || "",
      originalTimestamp: Date.now(),
      messageId: uuidv4(),
      writeKey: this.config.writeKey || "",
      otherIds: this.mergeOtherIds(otherIds),
      context: contextWithSession,
      properties: {
        ...properties,
      },
    }

    console.log("Tracking event...", payload)
    this.sendPayload(payload)
  }

  public identify = async (
    userId: string,
    deviceSessionId: string,
    userSessionId: string,
    properties?: Record<string, any>,
    otherIds?: Record<string, any>,
  ): Promise<void> => {
    this.setUserId(userId)

    const contextWithSession: EventContext = this.context
      ? {
          ...this.context,
          session: {
            deviceSessionId,
            userSessionId,
          },
        }
      : {
          library: { name: "", type: "" },
          userAgent: { deviceType: "", osType: "", osVersion: "", browser: "", ua: "" },
          session: {
            deviceSessionId,
            userSessionId,
          },
        }

    const payload: EventPayload = {
      type: "identify",
      event: "identify_event",
      userId: userId,
      id: this.profileId, // Profile ID as main identifier
      deviceId: this.deviceId,
      originalTimestamp: Date.now(),
      messageId: uuidv4(),
      writeKey: this.config.writeKey || "",
      otherIds: this.mergeOtherIds(otherIds),
      context: contextWithSession,
      customerProperties: {
        ...properties,
      },
    }

    console.log("Identify event...", payload)
    this.sendPayload(payload)
  }

  public login = async (
    userId: string,
    deviceSessionId: string,
    userSessionId: string,
    properties?: Record<string, any>,
    otherIds?: Record<string, any>,
    identifier: string = "User_login",
  ): Promise<void> => {
    console.log("Logging in user", this.userId)
    this.identify(userId, deviceSessionId, userSessionId, properties, otherIds)
    if (this.config.enableUserLogoutLogging) {
      this.track(identifier, deviceSessionId, userSessionId, properties, otherIds)
    }
    this.setUserId(userId)
  }

  public logout = async (deviceSessionId: string, userSessionId: string): Promise<void> => {
    // Track logout event if logging is enabled
    if (this.config.enableUserLogoutLogging) {
      this.track("User_logout", deviceSessionId, userSessionId)
    }

    // Always remove user data regardless of logging setting
    this.removeUserId()
  }

  private setUserId = (userId: string): void => {
    this.userId = userId || null
    this.saveIdentityData()
  }

  private removeUserId = (): void => {
    this.userId = null
    localStorage.removeItem(this.SESSION_ID)

    // Generate new profile ID for new user/profile, but keep device ID (same device)
    this.profileId = this.createProfileId()
    this.saveIdentityData()

    // Device ID stays the same - it's tied to the physical device, not the user
  }

  // New localStorage methods using single object
  private getStoredIdentityData = (): Partial<IdentityData> => {
    const stored = localStorage.getItem(this.CDP_STORAGE_KEY)

    if (!stored) {
      return {}
    }

    try {
      const parsed = JSON.parse(stored)
      return parsed
    } catch (error) {
      console.error("getStoredIdentityData - error parsing stored data:", error)
      return {}
    }
  }

  private saveIdentityData = (): void => {
    const identityData: IdentityData = {
      profileId: this.profileId,
      deviceId: this.deviceId,
      userId: this.userId || "",
    }

    localStorage.setItem(this.CDP_STORAGE_KEY, JSON.stringify(identityData))
  }

  private createProfileId = (): string => {
    const profileId = uuidv4()
    return profileId
  }

  private createDeviceId = (): string => {
    const deviceId = uuidv4()
    return deviceId
  }

  // Public methods to get identity data
  public getIdentityData = (): IdentityData => {
    return {
      profileId: this.profileId,
      deviceId: this.deviceId,
      userId: this.userId || "",
    }
  }

  public getProfileId = (): string => {
    return this.profileId
  }

  public getDeviceId = (): string => {
    return this.deviceId
  }

  public getUserId = (): string => {
    return this.userId || ""
  }

  private sendPayload = async (payload: EventPayload): Promise<void> => {
    console.log("🚀 Sending payload with session context:", payload)

    const xhr: XMLHttpRequest = new XMLHttpRequest()

    xhr.open(
      "POST",
      `${
        this.config.cdpEndpoint.endsWith("/") ? this.config.cdpEndpoint : `${this.config.cdpEndpoint}/`
      }analyze/analyze.php`,
      true,
    )
    xhr.withCredentials = true

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.info("Payload sent successfully:", xhr.responseText)
      } else {
        console.error(`API responded with status ${xhr.status}:`, xhr.responseText)
      }
    }

    xhr.onerror = e => {
      console.error("Request error:", e)
    }

    xhr.send(JSON.stringify(payload))
  }

  private collectCommonCookies = (): void => {
    const cookiesToCheck = ["_ga", "_fbc", "_fbp", "mcmid"]
    cookiesToCheck.forEach(cookieName => {
      const cookieValue = this.getCookie(cookieName)
      if (cookieValue) {
        this.commonIds[cookieName] = cookieValue
      }
    })
  }

  private getCookie = (name: string): string => {
    if (typeof document === "undefined") return ""

    // Method 1: Standard approach
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() ?? ""
    }

    // Method 2: Alternative approach using regex
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
    if (match) {
      return match[2]
    }

    return ""
  }

  private mergeOtherIds = (otherIds?: Record<string, any>): Record<string, any> => {
    // Refresh cookies every time we send an event (in case they were set later)
    this.collectCommonCookies()

    return {
      ...this.commonIds,
      ...otherIds,
    }
  }

  public refreshCommonCookies = (): void => {
    this.collectCommonCookies()
  }

  /**
   * Captures geolocation if browser has already granted permission.
   * Uses the Permissions API to check first, only calls getCurrentPosition if already granted.
   * Location is captured once at initialization and stored in context for all subsequent events.
   *
   * NOTE: This captures location once at init. Future versions may support dynamic updates
   * or per-event location capture based on use case requirements.
   */
  private captureGeolocation = async (): Promise<void> => {
    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      console.log("🌍 Geolocation not supported by browser")
      return
    }

    try {
      // Check if Permissions API is supported
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: "geolocation" as PermissionName })

        if (permissionStatus.state === "granted") {
          console.log("🌍 Geolocation permission already granted, capturing location...")
          await this.getCurrentLocation()
        } else {
          console.log(`🌍 Geolocation permission not granted (${permissionStatus.state}), skipping location capture`)
        }
      } else {
        // Fallback: If Permissions API not supported, we cannot safely check without potentially prompting
        // So we skip location capture to respect the "do not ask for permission" requirement
        console.log("🌍 Permissions API not supported, skipping location capture to avoid prompting user")
      }
    } catch (error) {
      console.log("🌍 Error checking geolocation permission:", error)
    }
  }

  /**
   * Gets current position and stores in context
   */
  private getCurrentLocation = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          if (this.context) {
            this.context.geolocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }
            console.log("🌍 Geolocation captured:", this.context.geolocation)
          }
          resolve()
        },
        error => {
          console.log("🌍 Error getting current position:", error.message)
          reject(error)
        },
        {
          timeout: 10000,
          maximumAge: 0,
        },
      )
    })
  }
}
