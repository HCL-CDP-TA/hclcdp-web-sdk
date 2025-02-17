// src/CdpClient.ts
import { v4 as uuidv4 } from "uuid";

// package.json
var package_default = {
  name: "hclcdp-web-sdk",
  version: "0.0.1",
  description: "HCL CDP Web SDK",
  keywords: [
    "HCLCDP"
  ],
  homepage: "https://github.com/simonpallisterhcl/hclcdp-web-sdk#readme",
  bugs: {
    url: "https://github.com/simonpallisterhcl/hclcdp-web-sdk/issues"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/simonpallisterhcl/hclcdp-web-sdk.git"
  },
  license: "MIT",
  author: "Simon Pallister",
  type: "module",
  main: "./dist/hclcdp-web.js",
  scripts: {
    build: "tsup"
  },
  dependencies: {
    axios: "^1.7.9",
    tsup: "^8.3.6",
    typescript: "^5.7.3",
    "ua-parser-js": "^2.0.2",
    uuid: "^11.0.5"
  }
};

// src/CdpClient.ts
import { UAParser } from "ua-parser-js";
var CdpClient = class {
  deviceId = null;
  userId = null;
  context = null;
  config = { writeKey: "", cdpEndpoint: "", inactivityTimeout: 30, enableSessionLogging: false };
  DEVICE_ID = "hclcdp_device_id";
  USER_ID = "hclcdp_user_id";
  constructor() {
    if (!this.deviceId) this.deviceId = this.getDeviceId();
  }
  init = async (config) => {
    this.config = config;
    console.log("init", config);
    const agent = UAParser(window.navigator.userAgent);
    this.context = {
      library: {
        name: package_default.name,
        type: "javascript",
        version: package_default.version
      },
      userAgent: {
        deviceType: agent.device.type || "Desktop",
        osType: agent.os.name || "",
        osVersion: agent.os.version || "",
        browser: agent.browser.name || "",
        ua: agent.ua
      }
    };
  };
  page = async (pageName, sessionId, properties, utmParams, otherIds) => {
    this.context.utm = utmParams;
    const payload = {
      type: "page",
      name: pageName,
      id: this.deviceId || "",
      originalTimestamp: Date.now(),
      sessionId,
      messageId: uuidv4(),
      writeKey: this.config.writeKey || "",
      otherIds: {
        ...otherIds
      },
      context: this.context,
      properties: {
        ...properties
      }
    };
    console.log("Page event...", payload);
    this.sendPayload(payload);
  };
  track = async (eventName, sessionId, properties, otherIds) => {
    const payload = {
      type: "track",
      event: eventName,
      id: this.deviceId || "",
      originalTimestamp: Date.now(),
      sessionId,
      messageId: uuidv4(),
      writeKey: this.config.writeKey || "",
      otherIds: {
        ...otherIds
      },
      context: this.context,
      properties: {
        ...properties
      }
    };
    console.log("Tracking event...", payload);
    this.sendPayload(payload);
  };
  identify = async (userId, sessionId, properties, otherIds) => {
    this.setUserId(userId);
    const payload = {
      type: "identify",
      userId,
      id: this.deviceId || "",
      originalTimestamp: Date.now(),
      sessionId,
      messageId: uuidv4(),
      writeKey: this.config.writeKey || "",
      otherIds: {
        ...otherIds
      },
      context: this.context,
      customerProperties: {
        ...properties
      }
    };
    console.log("Identify event...", payload);
    this.sendPayload(payload);
  };
  login = async (userId, sessionId, properties, otherIds) => {
    this.identify(userId, sessionId, properties, otherIds);
    this.track("User_login", sessionId, properties, otherIds);
    this.setUserId(userId);
  };
  logout = async (sessionId) => {
    this.track("User_logout", sessionId);
    this.removeUserId();
  };
  setUserId = (userId) => {
    this.userId = userId || null;
    localStorage.setItem(this.USER_ID, userId);
  };
  removeUserId = () => {
    this.userId = null;
    localStorage.removeItem(this.USER_ID);
  };
  getDeviceId = () => {
    let deviceId = localStorage.getItem(this.DEVICE_ID);
    if (!deviceId) {
      deviceId = this.createDeviceId();
      localStorage.setItem(this.DEVICE_ID, deviceId);
    }
    return deviceId;
  };
  createDeviceId = () => {
    return uuidv4();
  };
  sendPayload = async (payload) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `${this.config.cdpEndpoint.endsWith("/") ? this.config.cdpEndpoint : `${this.config.cdpEndpoint}/`}analyze/analyze.php`,
      true
    );
    xhr.withCredentials = true;
    xhr.send(JSON.stringify(payload));
    xhr.onerror = (e) => {
      console.error("Request error:", e);
    };
  };
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
};

// src/SessionManager.ts
import { v4 as uuidv42 } from "uuid";
var SessionManager = class {
  sessionId = null;
  inactivityTimeout;
  inactivityTimer = null;
  SESSION_DATA = "hclcdp_session";
  onSessionStart;
  onSessionEnd;
  constructor(config, onSessionStart, onSessionEnd) {
    this.inactivityTimeout = (config.inactivityTimeout || 30) * 60 * 1e3;
    this.onSessionStart = onSessionStart || ((sessionId) => {
      console.log(`Default: Session started with ID: ${sessionId}`);
    });
    this.onSessionEnd = onSessionEnd || ((sessionId) => {
      console.log(`Default: Session ended with ID: ${sessionId}`);
    });
    this.initializeSession();
    this.setupActivityListeners();
  }
  initializeSession() {
    const sessionData = this.getSessionData();
    if (sessionData && this.isSessionValid(sessionData)) {
      this.sessionId = sessionData.sessionId;
      this.resetInactivityTimer();
    } else {
      this.startNewSession();
    }
  }
  getSessionData() {
    const sessionDataJson = localStorage.getItem(this.SESSION_DATA);
    return sessionDataJson ? JSON.parse(sessionDataJson) : null;
  }
  saveSessionData(sessionData) {
    localStorage.setItem(this.SESSION_DATA, JSON.stringify(sessionData));
  }
  isSessionValid(sessionData) {
    const currentTime = Date.now();
    return currentTime - sessionData.lastActivityTimestamp < this.inactivityTimeout;
  }
  generateSessionId() {
    return uuidv42();
  }
  startNewSession() {
    this.sessionId = this.generateSessionId();
    const sessionData = {
      sessionId: this.sessionId,
      lastActivityTimestamp: Date.now(),
      sessionStartTimestamp: Date.now()
    };
    this.saveSessionData(sessionData);
    this.resetInactivityTimer();
    this.onSessionStart(this.sessionId);
  }
  resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    this.inactivityTimer = setTimeout(() => {
      this.endSession();
    }, this.inactivityTimeout);
    const sessionData = this.getSessionData();
    if (sessionData) {
      sessionData.lastActivityTimestamp = Date.now();
      this.saveSessionData(sessionData);
    }
  }
  endSession() {
    localStorage.removeItem(this.SESSION_DATA);
    this.onSessionEnd(this.sessionId);
    this.sessionId = null;
  }
  setupActivityListeners() {
    const activityEvents = ["mousemove", "keydown", "scroll"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, () => this.resetInactivityTimer());
    });
  }
  getSessionId() {
    return this.sessionId;
  }
};

// src/EventQueue.ts
var EventQueue = class _EventQueue {
  static PAGE_QUEUE_KEY = "hcl_cdp_page_queue";
  static TRACK_QUEUE_KEY = "hcl_cdp_track_queue";
  static IDENTIFY_QUEUE_KEY = "hcl_cdp_identify_queue";
  static addToQueue(queueKey, payload) {
    const queue = this.getQueue(queueKey);
    queue.push(payload);
    localStorage.setItem(queueKey, JSON.stringify(queue));
  }
  static getQueue(queueKey) {
    const queue = localStorage.getItem(queueKey);
    return queue ? JSON.parse(queue) : [];
  }
  static clearQueue(queueKey) {
    localStorage.removeItem(queueKey);
  }
  static flushQueue(queueKey, method) {
    const queue = this.getQueue(queueKey);
    queue.forEach((payload) => {
      try {
        switch (queueKey) {
          case _EventQueue.PAGE_QUEUE_KEY:
            method(payload.pageName, payload.properties, payload.otherIds);
            break;
          case _EventQueue.TRACK_QUEUE_KEY:
            method(payload.eventName, payload.properties, payload.otherIds);
            break;
          case _EventQueue.IDENTIFY_QUEUE_KEY:
            method(payload.userId, payload.properties, payload.otherIds);
            break;
        }
      } catch (error) {
        console.error(`Error flushing ${queueKey} event:`, error);
      }
    });
    this.clearQueue(queueKey);
  }
};
var EventQueue_default = EventQueue;

// src/HclCdp.ts
var HclCdp = class _HclCdp {
  static instance;
  cdpClient = null;
  static deviceId = null;
  sessionId = null;
  sessionManager = null;
  static config = {
    writeKey: "",
    cdpEndpoint: "",
    inactivityTimeout: 30,
    enableSessionLogging: false,
    enableUserLogoutLogging: false
  };
  constructor() {
  }
  static async init(config, callback) {
    if (!_HclCdp.instance) {
      _HclCdp.instance = new _HclCdp();
    }
    this.config = config;
    _HclCdp.instance.cdpClient = new CdpClient();
    _HclCdp.instance.sessionManager = new SessionManager(config, _HclCdp.onSessionStart, _HclCdp.onSessionEnd);
    try {
      await _HclCdp.instance.cdpClient.init(config);
      EventQueue_default.flushQueue(EventQueue_default.PAGE_QUEUE_KEY, _HclCdp.instance.cdpClient.page.bind(_HclCdp.instance.cdpClient));
      EventQueue_default.flushQueue(EventQueue_default.TRACK_QUEUE_KEY, _HclCdp.instance.cdpClient.track.bind(_HclCdp.instance.cdpClient));
      EventQueue_default.flushQueue(
        EventQueue_default.IDENTIFY_QUEUE_KEY,
        _HclCdp.instance.cdpClient.identify.bind(_HclCdp.instance.cdpClient)
      );
      if (typeof window !== "undefined") {
        if (!window.HclCdp) {
          window.HclCdp = _HclCdp;
        } else {
          console.warn("window.HclCdp is already defined. Skipping attachment.");
        }
      }
      const commonIds = {};
      const cookiesToCheck = ["_ga", "_fbc", "_fbp", "mcmid"];
      cookiesToCheck.forEach((cookieName) => {
        const cookieValue = getCookie(cookieName);
        if (cookieValue) {
          commonIds[cookieName] = cookieValue;
        }
      });
      if (callback) callback(null, { deviceId: _HclCdp.getDeviceId() || null, sessionId: _HclCdp.getSessionId() || null });
    } catch (error) {
      console.log("Error initializing HCL CDP SDK:", error);
      if (callback) callback(error);
    }
  }
  static onSessionStart = (sessionId) => {
    if (this.config.enableSessionLogging) {
      _HclCdp.instance.cdpClient?.track("Session_Start", sessionId);
    }
  };
  static onSessionEnd = (sessionId) => {
    if (this.config.enableSessionLogging) {
      _HclCdp.instance.cdpClient?.track("Session_End", sessionId);
    }
  };
  static page = async (pageName, properties, otherIds) => {
    const payload = {
      sessionId: this.getSessionId(),
      pageName,
      properties: {
        ...properties,
        path: window.location.pathname,
        url: window.location.href,
        referrer: document.referrer,
        title: document.title,
        search: document.location.search
      },
      otherIds
    };
    if (!_HclCdp.instance || !_HclCdp.instance.cdpClient) {
      console.log("adding to queue");
      EventQueue_default.addToQueue(EventQueue_default.PAGE_QUEUE_KEY, payload);
      return;
    }
    const pageProperties = {
      ...properties,
      path: document.location.pathname,
      url: document.location.href,
      referrer: document.referrer,
      title: document.title,
      search: document.location.search
    };
    const utmParams = this.parseUtmParameters(document.location.pathname);
    _HclCdp.instance.cdpClient.page(pageName, this.getSessionId(), pageProperties, utmParams, otherIds);
  };
  static track = async (eventName, properties, otherIds) => {
    const payload = {
      sessionId: this.getSessionId(),
      eventName,
      properties,
      otherIds
    };
    if (!_HclCdp.instance || !_HclCdp.instance.cdpClient) {
      EventQueue_default.addToQueue(EventQueue_default.TRACK_QUEUE_KEY, payload);
      return;
    }
    _HclCdp.instance.cdpClient.track(eventName, this.getSessionId(), properties, otherIds);
  };
  static identify = async (userId, properties, otherIds) => {
    const payload = {
      sessionId: this.getSessionId(),
      userId,
      properties,
      otherIds
    };
    if (!_HclCdp.instance || !_HclCdp.instance.cdpClient) {
      EventQueue_default.addToQueue(EventQueue_default.IDENTIFY_QUEUE_KEY, payload);
      return;
    }
    _HclCdp.instance.cdpClient.identify(userId, this.getSessionId(), properties, otherIds);
  };
  static getDeviceId() {
    return _HclCdp.instance?.cdpClient?.deviceId || "";
  }
  static getSessionId() {
    return _HclCdp.instance?.sessionManager?.getSessionId() || "";
  }
  static logout = async () => {
    if (this.config.enableUserLogoutLogging) {
      _HclCdp.instance.cdpClient?.logout(this.getSessionId());
    }
  };
  static parseUtmParameters = (path) => {
    try {
      const utmRegex = /(?:\?|&)(utm_[^=]+)=(.*?)(?=&|$)/gi;
      const utmParams = {};
      let match;
      while ((match = utmRegex.exec(document.URL)) !== null) {
        utmParams[match[1]] = match[2];
      }
      return utmParams;
    } catch (e) {
      console.error("Error parsing UTM parameters:", e);
      return {};
    }
  };
  static getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() ?? "";
    }
    return "";
  };
};
export {
  HclCdp
};
