import { v4 as uuidv4 } from "uuid"
import packageJson from "../package.json" assert { type: "json" }
import { IResult, UAParser } from "ua-parser-js"
import { HclCdpConfig } from "./types"
import type { EventContext, EventPayload } from "./types"

interface SafariWindow extends Window {
  safari?: {
    pushNotification?: {
      toString: () => string
    }
  }
}

export class CdpClient {
  public deviceId: string | null = null
  public userId: string | null = null
  private context: EventContext | null = null
  private config: HclCdpConfig = { writeKey: "", cdpEndpoint: "", inactivityTimeout: 30, enableSessionLogging: false }

  private readonly DEVICE_ID = "hclcdp_device_id"
  private readonly USER_ID = "hclcdp_user_id"

  constructor() {
    if (!this.deviceId) this.deviceId = this.getDeviceId()
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
      id: this.deviceId || "",
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
      id: this.deviceId || "",
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
      id: this.deviceId || "",
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
    this.identify(userId, sessionId, properties, otherIds)
    if (this.config.enableUserLogoutLogging) {
      this.track(identifier, sessionId, properties, otherIds)
    }
    this.setUserId(userId)
  }

  public logout = async (sessionId: string): Promise<void> => {
    if (this.config.enableUserLogoutLogging) {
      this.track("User_logout", sessionId)
    }
    this.removeUserId()
  }

  private setUserId = (userId: string): void => {
    this.userId = userId || null
    localStorage.setItem(this.USER_ID, userId)
  }

  private removeUserId = (): void => {
    this.userId = null
    localStorage.removeItem(this.USER_ID)
  }

  private getDeviceId = (): string | null => {
    let deviceId = localStorage.getItem(this.DEVICE_ID)
    if (!deviceId) {
      deviceId = this.createDeviceId()
      localStorage.setItem(this.DEVICE_ID, deviceId)
    }
    return deviceId
  }

  private createDeviceId = (): string => {
    return uuidv4()
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
