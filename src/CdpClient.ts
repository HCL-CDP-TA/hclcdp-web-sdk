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
  private config: HclCdpConfig = { writeKey: "", cdpEndpoint: "", inactivityTimeout: 30, enableSessionLogging: false }

  private readonly CDP_STORAGE_KEY = "hclcdp_identity_data"
  private readonly SESSION_ID = "hclcdp_session_id" // Keep session separate as it has different lifecycle

  constructor() {
    console.log("🚨 CDPCLIENT CONSTRUCTOR CALLED 🚨")
    console.log("📦 SDK Version:", packageJson.version)
    console.log("🕐 Constructor timestamp:", new Date().toISOString())
    console.log("CdpClient constructor - starting ID initialization")

    // First, migrate any old localStorage data to new format
    this.migrateOldLocalStorageData()

    // Load all identity data from single localStorage object
    const identityData = this.getStoredIdentityData()

    // Profile ID - persistent across sessions for the same person/profile
    this.profileId = identityData.profileId || this.createProfileId()
    console.log("Profile ID initialized:", this.profileId)

    // Device ID - persistent per device, different from profile ID
    this.deviceId = identityData.deviceId || this.createDeviceId()
    console.log("Device ID initialized:", this.deviceId)

    // User ID - only set when user identifies themselves
    this.userId = identityData.userId || null
    console.log("User ID initialized:", this.userId)

    // Save the identity data back to localStorage
    this.saveIdentityData()

    console.log("CdpClient constructor - ID initialization complete")
  }

  public init = async (config: HclCdpConfig): Promise<void> => {
    this.config = config
    console.log("init", config)
    const agent: IResult = UAParser(window.navigator.userAgent)

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
    }
  }

  public page = async (
    pageName: string,
    sessionId: string,
    properties?: Record<string, any>,
    utmParams?: Record<string, any>,
    otherIds?: Record<string, any>,
  ): Promise<void> => {
    if (this.context && utmParams) {
      this.context.utm = utmParams
    }

    const payload: EventPayload = {
      type: "page",
      event: "page_view",
      name: pageName,
      id: this.profileId, // Profile ID as main identifier
      deviceId: this.deviceId,
      userId: this.userId || "",
      deviceType: this.context?.userAgent.deviceType || "Unknown",
      originalTimestamp: Date.now(),
      sessionId,
      messageId: uuidv4(),
      writeKey: this.config.writeKey || "",
      otherIds: {
        ...otherIds,
      },
      context: this.context || {
        library: { name: "", type: "" },
        userAgent: { deviceType: "", osType: "", osVersion: "", browser: "", ua: "" },
      },
      properties: {
        ...properties,
      },
    }

    this.sendPayload(payload)
  }

  public track = async (
    eventName: string,
    sessionId: string,
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

    const payload: EventPayload = {
      type: "track",
      event: eventName,
      id: this.profileId, // Profile ID as main identifier
      deviceId: this.deviceId,
      userId: this.userId || "",
      deviceType: this.context?.userAgent.deviceType || "Unknown",
      originalTimestamp: Date.now(),
      sessionId,
      messageId: uuidv4(),
      writeKey: this.config.writeKey || "",
      otherIds: {
        ...otherIds,
      },
      context: this.context as EventContext,
      properties: {
        ...properties,
      },
    }

    console.log("Tracking event...", payload)
    this.sendPayload(payload)
  }

  public identify = async (
    userId: string,
    sessionId: string,
    properties?: Record<string, any>,
    otherIds?: Record<string, any>,
  ): Promise<void> => {
    this.setUserId(userId)

    const payload: EventPayload = {
      type: "identify",
      event: "identify_event",
      userId: userId,
      id: this.profileId, // Profile ID as main identifier
      deviceId: this.deviceId,
      deviceType: this.context?.userAgent.deviceType || "Unknown",
      originalTimestamp: Date.now(),
      sessionId,
      messageId: uuidv4(),
      writeKey: this.config.writeKey || "",
      otherIds: {
        ...otherIds,
      },
      context: this.context || {
        library: { name: "", type: "" },
        userAgent: { deviceType: "", osType: "", osVersion: "", browser: "", ua: "" },
      },
      customerProperties: {
        ...properties,
      },
    }

    console.log("Identify event...", payload)
    this.sendPayload(payload)
  }

  public login = async (
    userId: string,
    sessionId: string,
    properties?: Record<string, any>,
    otherIds?: Record<string, any>,
    identifier: string = "User_login",
  ): Promise<void> => {
    console.log("Logging in user", this.userId)
    this.identify(userId, sessionId, properties, otherIds)
    if (this.config.enableUserLogoutLogging) {
      this.track(identifier, sessionId, properties, otherIds)
    }
    this.setUserId(userId)
  }

  public logout = async (sessionId: string): Promise<void> => {
    // Track logout event if logging is enabled
    if (this.config.enableUserLogoutLogging) {
      this.track("User_logout", sessionId)
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

  // Migrate old localStorage format to new single object format
  private migrateOldLocalStorageData = (): void => {
    console.log("migrateOldLocalStorageData - checking for old format data")

    // Check if new format already exists
    const existingData = localStorage.getItem(this.CDP_STORAGE_KEY)
    if (existingData) {
      console.log("migrateOldLocalStorageData - new format already exists, skipping migration")
      return
    }

    // Check for old format data
    const oldProfileId = localStorage.getItem("hclcdp_profile_id") || localStorage.getItem("hclcdp_device_id") // Previous naming
    const oldDeviceId = localStorage.getItem("hclcdp_device_id")
    const oldUserId = localStorage.getItem("hclcdp_user_id")

    if (oldProfileId || oldDeviceId || oldUserId) {
      console.log("migrateOldLocalStorageData - found old format data, migrating...")
      console.log("Old Profile ID:", oldProfileId)
      console.log("Old Device ID:", oldDeviceId)
      console.log("Old User ID:", oldUserId)

      // Create new format object
      const migratedData: Partial<IdentityData> = {
        profileId: oldProfileId || undefined,
        deviceId: oldDeviceId || undefined,
        userId: oldUserId || undefined,
      }

      // Save in new format
      localStorage.setItem(this.CDP_STORAGE_KEY, JSON.stringify(migratedData))
      console.log("migrateOldLocalStorageData - migrated data:", migratedData)

      // Clean up old format
      localStorage.removeItem("hclcdp_profile_id")
      localStorage.removeItem("hclcdp_device_id")
      localStorage.removeItem("hclcdp_user_id")
      console.log("migrateOldLocalStorageData - cleaned up old format keys")
    } else {
      console.log("migrateOldLocalStorageData - no old format data found")
    }
  }

  // New localStorage methods using single object
  private getStoredIdentityData = (): Partial<IdentityData> => {
    console.log("getStoredIdentityData - checking localStorage for key:", this.CDP_STORAGE_KEY)
    const stored = localStorage.getItem(this.CDP_STORAGE_KEY)
    console.log("getStoredIdentityData - found in localStorage:", stored)

    if (!stored) {
      console.log("getStoredIdentityData - no existing data, returning empty object")
      return {}
    }

    try {
      const parsed = JSON.parse(stored)
      console.log("getStoredIdentityData - parsed data:", parsed)
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

    console.log("saveIdentityData - saving data:", identityData)
    localStorage.setItem(this.CDP_STORAGE_KEY, JSON.stringify(identityData))
    console.log("saveIdentityData - saved to localStorage")
  }

  private createProfileId = (): string => {
    const profileId = uuidv4()
    console.log("createProfileId - generated:", profileId)
    return profileId
  }

  private createDeviceId = (): string => {
    const deviceId = uuidv4()
    console.log("createDeviceId - generated:", deviceId)
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
}
