import { v4 as uuidv4 } from "uuid"
import packageJson from "../package.json" assert { type: "json" }
import { IResult, UAParser } from "ua-parser-js"
import { HclCdpConfig } from "./types"
import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import type { EventContext, EventPayload } from "./types"
import CrossOriginRequest from "./CrossOriginRequest"

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
    otherIds?: Record<string, any>,
  ): Promise<void> => {
    const payload: EventPayload = {
      type: "page",
      name: pageName,
      id: this.deviceId || "",
      originalTimestamp: Date.now(),
      sessionId,
      messageId: uuidv4(),
      writeKey: this.config.writeKey || "",
      otherIds: {
        ...otherIds,
      },
      context: this.context,
      properties: {
        ...properties,
      },
    }

    console.log("Page event...", payload)
    this.sendPayload(payload)
  }

  public track = async (
    eventName: string,
    sessionId: string,
    properties?: Record<string, any>,
    otherIds?: Record<string, any>,
  ): Promise<void> => {
    const payload: EventPayload = {
      type: "track",
      event: eventName,
      id: this.deviceId || "",
      originalTimestamp: Date.now(),
      sessionId,
      messageId: uuidv4(),
      writeKey: this.config.writeKey || "",
      otherIds: {
        ...otherIds,
      },
      context: this.context,
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
      userId: userId,
      id: this.deviceId || "",
      originalTimestamp: Date.now(),
      sessionId,
      messageId: uuidv4(),
      writeKey: this.config.writeKey || "",
      otherIds: {
        ...otherIds,
      },
      context: this.context,
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
  ): Promise<void> => {
    this.identify(userId, sessionId, properties, otherIds)
    this.track("User_login", sessionId, properties, otherIds)
    this.setUserId(userId)
  }

  public logout = async (sessionId: string): Promise<void> => {
    this.track("User_logout", sessionId)
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
    xhr.send(JSON.stringify(payload))

    xhr.onerror = e => {
      console.error("Request error:", e)
    }
  }

  // private createDeviceId = (): string => {
  //   return Math.floor(Date.now() * Math.random()).toString()
  // }
  // private createDeviceId = (): string => {
  //   const prefix = this.isSafari() ? "vizSF_" : "viz_"
  //   const maxRandomValue = 7418186
  //   const timestampHex = Math.floor(Date.now() / 1000).toString(16)

  //   let randomHex = Math.floor(Math.random() * maxRandomValue).toString(16)
  //   while (randomHex.length < 5) {
  //     randomHex += Math.floor(Math.random() * maxRandomValue).toString(16)
  //   }

  //   // Take the last 5 characters to ensure consistent length
  //   randomHex = randomHex.slice(-5)

  //   return `${prefix}${timestampHex}${randomHex}`
  // }

  // private isSafari = (): boolean => {
  //   return (
  //     Object.prototype.toString.call(window.HTMLElement).includes("Constructor") ||
  //     !!((window as SafariWindow).safari?.pushNotification?.toString() === "[object SafariRemoteNotification]")
  //   )
  // }
}
