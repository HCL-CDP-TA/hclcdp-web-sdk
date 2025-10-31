[![Version](https://img.shields.io/github/v/release/HCL-CDP-TA/hclcdp-web-sdk)](https://github.com/HCL-CDP-TA/hclcdp-web-sdk/releases)

# HCL CDP Web SDK

A comprehensive JavaScript SDK for integrating with the HCL Customer Data Platform (CDP), providing streamlined event tracking, identity management, session handling, and destination routing capabilities.

## Features

- **Simple API**: Streamlined interface with only essential methods
- **Runtime Configuration**: Dynamically adjust settings without reinitializing
- **Dual Module Support**: Works with both CommonJS and ES modules
- **Dual Session Management**: Separate device and user session tracking with configurable timeouts
- **Identity Management**: Separate device ID and profile ID management
- **Event Queuing**: Automatic event queuing before SDK initialization
- **Destination Routing**: Built-in support for Google Analytics 4 and Facebook Pixel
- **TypeScript Support**: Full TypeScript definitions included

## Installation

```bash
npm install @hcl-cdp-ta/hclcdp-web-sdk
```

```bash
yarn add @hcl-cdp-ta/hclcdp-web-sdk
```

## Quick Start

```javascript
import { HclCdp } from "@hcl-cdp-ta/hclcdp-web-sdk"
import { GoogleAnalytics, Facebook } from "@hcl-cdp-ta/hclcdp-web-sdk"

const config = {
  writeKey: "your-write-key",
  cdpEndpoint: "https://your-cdp-endpoint.com",
  inactivityTimeout: 30, // Session timeout in minutes
  enableDeviceSessionLogging: true, // Track device session start/end events
  enableUserSessionLogging: true, // Track user session start/end events
  enableUserLogoutLogging: true, // Track user logout events
  destinations: [
    {
      id: "GA4",
      classRef: GoogleAnalytics,
      config: { measurementId: "G-XXXXXXXXXX" },
    },
    {
      id: "Facebook",
      classRef: Facebook,
      config: { pixelId: "your-pixel-id" },
    },
  ],
}

// Initialize the SDK
await HclCdp.init(config, (error, sessionData) => {
  if (error) {
    console.error("CDP initialization failed:", error)
  } else {
    console.log("CDP initialized:", sessionData)
    // { deviceSessionId: "...", userSessionId: "...", deviceId: "..." }
  }
})

// Track events
HclCdp.track("Purchase", {
  value: 99.99,
  currency: "USD",
  items: ["product-1", "product-2"],
})

// Track page views
HclCdp.page("Product Page", {
  product_id: "123",
  category: "Electronics",
})

// Identify users
HclCdp.identify("user-123", {
  email: "user@example.com",
  name: "John Doe",
  tier: "premium",
})

// Logout users
HclCdp.logout()
```

## Automatic Session Renewal

The SDK automatically manages session lifecycle and ensures that all events are tracked with valid sessions:

- **Automatic Renewal**: If a session expires due to inactivity, the SDK automatically creates a new session when the next event (track, identify, page, etc.) is called
- **No Lost Events**: Events are never sent with empty or invalid session IDs
- **Seamless Experience**: Session renewal happens transparently without requiring any action from your code

This means you don't need to worry about session expiration - just call your tracking methods as normal, and the SDK will ensure they're always associated with a valid session.

## Session End Callbacks

You can listen for session ending events by providing callback functions in the configuration:

```javascript
const config = {
  writeKey: "your-write-key",
  cdpEndpoint: "https://your-cdp-endpoint.com",

  // Called when a device session ends (due to inactivity timeout)
  onDeviceSessionEnd: sessionData => {
    console.log("Device session ended:", sessionData)
    // { deviceSessionId: "dev_123", userSessionId: "user_456", reason: "timeout" }

    // Take action when user session expires
    // e.g., show session timeout notification, redirect to login
  },

  // Called when a user session ends (login, logout, or timeout)
  onUserSessionEnd: sessionData => {
    console.log("User session ended:", sessionData)
    // { deviceSessionId: "dev_123", userSessionId: "user_456", reason: "login" | "logout" | "timeout" }

    switch (sessionData.reason) {
      case "timeout":
        // Handle session timeout
        showSessionTimeoutNotification()
        break
      case "login":
        // Previous session ended due to new login
        break
      case "logout":
        // Session ended due to explicit logout
        redirectToHomePage()
        break
    }
  },
}

await HclCdp.init(config)
```

### Session End Reasons

- **`timeout`**: Session ended due to inactivity timeout
- **`login`**: User session ended because user logged in (starts new user session)
- **`logout`**: User session ended because user logged out

## Core API Methods

### Automatic Cookie Collection

The SDK automatically collects common tracking cookies and includes them in the `otherIds` section of all events:

- **`_ga`** - Google Analytics client ID
- **`_fbc`** - Facebook Click ID
- **`_fbp`** - Facebook Browser ID
- **`mcmid`** - Adobe Marketing Cloud ID

These cookies are automatically merged with any manually provided `otherIds`, with manual values taking precedence over automatically collected ones.

```javascript
// Even with empty otherIds, automatic cookies are included
HclCdp.track("Purchase", { value: 99.99 }, {})

// Manual otherIds are merged with automatic cookies
HclCdp.track("Purchase", { value: 99.99 }, { custom_id: "abc123" })

// Final payload otherIds will contain:
// {
//   "_ga": "GA1.1.123456789.1640995200",
//   "_fbp": "fb.1.1640995200.123456789",
//   "custom_id": "abc123"
// }
```

### Event Tracking Methods

#### `HclCdp.track(eventName, properties?, otherIds?)`

Track custom events with optional properties and additional identifiers.

```javascript
HclCdp.track(
  "Button Click",
  {
    button_text: "Subscribe",
    location: "header",
  },
  {
    custom_id: "abc123",
  },
)
```

#### `HclCdp.page(pageName, properties?, otherIds?)`

Track page views with automatic URL context and custom properties.

```javascript
HclCdp.page("Home", {
  section: "landing",
  experiment: "variant-a",
})
```

#### `HclCdp.identify(userId, properties?, otherIds?)`

Associate events with specific users and update user profiles. **Does not create a new user session** - keeps existing session IDs.

```javascript
HclCdp.identify("user-456", {
  email: "jane@example.com",
  signup_date: "2024-01-15",
  preferences: { newsletter: true },
})
```

#### `HclCdp.login(userId, properties?, otherIds?)`

Start a new user session and identify the user (combines identify + new user session). **Creates a new user session ID** while preserving the device session.

```javascript
HclCdp.login("user-789", {
  email: "user@example.com",
  login_method: "social",
})
```

#### `HclCdp.logout()`

Clear user identity and start a new user session (device session continues).

```javascript
HclCdp.logout()
```

### When to Use identify() vs login()

**Use `identify()` when:**

- User updates their profile information
- You want to associate events with a user without changing sessions
- Tracking user behavior within the same session
- User hasn't actually "logged in" but you know who they are (e.g., from cookies)

**Use `login()` when:**

- User enters credentials and authenticates
- Starting a fresh user session after login
- You want session analytics to reflect authentication events
- User switches between accounts

### Data Access Methods

#### `HclCdp.getIdentityData()`

Get current identity information including profile ID, device ID, and user ID.

```javascript
const identity = HclCdp.getIdentityData()
// {
//   profileId: "prof_abc123",
//   deviceId: "dev_xyz789",
//   userId: "user-456"
// }
```

#### `HclCdp.getSessionData()`

Get current session information with timestamps for both device and user sessions.

```javascript
const session = HclCdp.getSessionData()
// {
//   deviceSessionId: "dev_sess_abc123",
//   userSessionId: "user_sess_def456",
//   sessionStartTimestamp: 1640995200000,
//   userSessionStartTimestamp: 1640996100000,
//   lastActivityTimestamp: 1640998800000
// }
```

#### `HclCdp.getDeviceSessionId()`

Get the current device session ID (persists across login/logout).

```javascript
const deviceSessionId = HclCdp.getDeviceSessionId()
// "dev_sess_abc123"
```

#### `HclCdp.getUserSessionId()`

Get the current user session ID (changes on login/logout).

```javascript
const userSessionId = HclCdp.getUserSessionId()
// "user_sess_def456"
```

## Runtime Configuration

Dynamically adjust SDK behavior without reinitialization:

### `HclCdp.setDeviceSessionLogging(enabled)`

Enable or disable automatic device session start/end event tracking.

```javascript
HclCdp.setDeviceSessionLogging(true) // Track device sessions
HclCdp.setDeviceSessionLogging(false) // Stop tracking device sessions
```

### `HclCdp.setUserSessionLogging(enabled)`

Enable or disable automatic user session start/end event tracking.

```javascript
HclCdp.setUserSessionLogging(true) // Track user sessions
HclCdp.setUserSessionLogging(false) // Stop tracking user sessions
```

### `HclCdp.setSessionLogging(enabled)` _(deprecated)_

Enable or disable device session tracking (maintained for backward compatibility).

```javascript
HclCdp.setSessionLogging(true) // Same as setDeviceSessionLogging(true)
```

### `HclCdp.setUserLogoutLogging(enabled)`

Enable or disable automatic user logout event tracking.

```javascript
HclCdp.setUserLogoutLogging(true) // Track logout events
HclCdp.setUserLogoutLogging(false) // Don't track logout events
```

### `HclCdp.setInactivityTimeout(minutes)`

Update session timeout duration with immediate effect.

```javascript
HclCdp.setInactivityTimeout(60) // 1 hour timeout
HclCdp.setInactivityTimeout(15) // 15 minute timeout
```

### `HclCdp.getConfig()`

Get current configuration settings.

```javascript
const config = HclCdp.getConfig()
// {
//   writeKey: "...",
//   cdpEndpoint: "...",
//   inactivityTimeout: 30,
//   enableDeviceSessionLogging: true,
//   enableUserSessionLogging: true,
//   enableUserLogoutLogging: false
// }
```

## Configuration Options

| Option                       | Type    | Default    | Description                                   |
| ---------------------------- | ------- | ---------- | --------------------------------------------- |
| `writeKey`                   | string  | _required_ | Your CDP source write key                     |
| `cdpEndpoint`                | string  | _required_ | Your CDP instance endpoint URL                |
| `inactivityTimeout`          | number  | 30         | Session timeout in minutes                    |
| `enableDeviceSessionLogging` | boolean | false      | Track device session start/end events         |
| `enableUserSessionLogging`   | boolean | false      | Track user session start/end events           |
| `enableUserLogoutLogging`    | boolean | false      | Track user logout events                      |
| `destinations`               | array   | []         | Third-party destination configurations        |
| `enableSessionLogging`       | boolean | false      | _(deprecated)_ Use enableDeviceSessionLogging |

## Destinations

The SDK supports routing events to third-party destinations:

### Google Analytics 4

```javascript
import { GoogleAnalytics } from "@hcl-cdp-ta/hclcdp-web-sdk"

const destinations = [
  {
    id: "GA4",
    classRef: GoogleAnalytics,
    config: { measurementId: "G-XXXXXXXXXX" },
  },
]
```

### Facebook Pixel

```javascript
import { Facebook } from "@hcl-cdp-ta/hclcdp-web-sdk"

const destinations = [
  {
    id: "Facebook",
    classRef: Facebook,
    config: { pixelId: "your-pixel-id" },
  },
]
```

## TypeScript Support

The SDK includes comprehensive TypeScript definitions:

```typescript
import { HclCdp, HclCdpConfig, IdentityData, FullSessionData } from "@hcl-cdp-ta/hclcdp-web-sdk"

const config: HclCdpConfig = {
  writeKey: "your-key",
  cdpEndpoint: "https://your-endpoint.com",
  inactivityTimeout: 45,
  enableDeviceSessionLogging: true,
  enableUserSessionLogging: true,
}

const identity: IdentityData | null = HclCdp.getIdentityData()
const session: FullSessionData | null = HclCdp.getSessionData()
```

## Breaking Changes in v1.0.0

### Dual Session Architecture

Version 1.0.0 introduces a **breaking change** with dual session management:

- **Device Session ID**: Persists across login/logout events (device-level tracking)
- **User Session ID**: Changes on each login/logout event (user-level tracking)

#### Event Payload Changes

Session IDs are now nested under `context.session` instead of being root-level properties:

**Before (v0.x):**

```json
{
  "type": "track",
  "event": "purchase",
  "sessionId": "abc123",
  "context": { ... }
}
```

**After (v1.0.0):**

```json
{
  "type": "track",
  "event": "purchase",
  "context": {
    "session": {
      "deviceSessionId": "abc123",
      "userSessionId": "def456"
    }
  }
}
```

#### Configuration Changes

- `enableSessionLogging` → `enableDeviceSessionLogging` (with backward compatibility)
- Added `enableUserSessionLogging` for separate user session event control

#### Migration Guide

1. **Update configuration** (optional, backward compatible):

   ```javascript
   // Old
   enableSessionLogging: true

   // New (both work)
   enableDeviceSessionLogging: true,
   enableUserSessionLogging: true
   ```

2. **Update event payload parsing** if you process CDP events:

   - Session IDs moved from root to `context.session`
   - Two session IDs instead of one

3. **Update session data access**:

   ```javascript
   // Old
   const sessionId = HclCdp.getSessionId()

   // New
   const deviceSessionId = HclCdp.getDeviceSessionId()
   const userSessionId = HclCdp.getUserSessionId()
   ```

## Advanced Usage

### Event Queuing

Events are automatically queued before SDK initialization and flushed once ready:

```javascript
// These events are queued automatically
HclCdp.track("Early Event") // Queued
HclCdp.page("Landing") // Queued

// Initialize SDK
await HclCdp.init(config) // Queued events are sent

// These events are sent immediately
HclCdp.track("Post Init") // Sent immediately
```

### Session Management

Sessions are managed automatically with configurable timeouts:

```javascript
// Session starts automatically on first event
HclCdp.track("First Event") // Creates new session

// Session continues with activity
HclCdp.page("Page View") // Extends session

// Session expires after inactivity timeout
// Next event creates new session
```

### Identity Management

The SDK maintains separate device and profile identities:

- **Device ID**: Persistent browser identifier stored in localStorage
- **Profile ID**: Anonymous profile identifier, cleared on logout
- **User ID**: Explicit user identifier set via `identify()`

## Related Packages

For React applications, use the React wrapper:

- [@hcl-cdp-ta/hclcdp-web-sdk-react](https://github.com/HCL-CDP-TA/hclcdp-web-sdk-react)

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Modern mobile browsers

## License

This project is licensed under the MIT License.

```

```
