# HCL CDP Web SDK - AI Agent Guide

## Project Overview

This is a **monorepo-style workspace** with three interconnected projects:
- `hclcdp-web-sdk`: Core TypeScript SDK for browser-based customer data platform tracking
- `hclcdp-web-sdk-react`: React wrapper providing hooks and components
- `hclcdp-web-sdk-test`: Next.js test app for local development

## Architecture: Dual Session System

**Critical Design Pattern**: The SDK maintains TWO separate session IDs:
- **Device Session ID**: Persists across login/logout (browser-level tracking)
- **User Session ID**: Resets on login/logout (user-level tracking)

This dual-session architecture was introduced in v1.0.0 and affects:
- Event payload structure: session IDs nested under `context.session`
- SessionManager lifecycle: separate callbacks for device vs user sessions
- API methods: `getDeviceSessionId()` vs `getUserSessionId()`

## Core Components

### Singleton Pattern (HclCdp.ts)
- Static class exposing SDK API (`track`, `page`, `identify`, `login`, `logout`)
- Attaches to `window.HclCdp` in browser for global access
- Manages instances of `CdpClient` and `SessionManager`

### Session Management (SessionManager.ts)
- Uses `sessionStorage` for session data, `localStorage` for identity
- **Auto-renewal**: Creates new session if expired when event triggered
- Supports callback chains: internal SDK callbacks → config callbacks → hook callbacks
- Activity listeners: mousemove, keydown, scroll reset inactivity timer

### Event Queue (EventQueue.ts)
- Queues events to `localStorage` before SDK initialization
- Three queues: `PAGE_QUEUE_KEY`, `TRACK_QUEUE_KEY`, `IDENTIFY_QUEUE_KEY`
- Flushed automatically on `HclCdp.init()` completion

### Cookie Collection (CdpClient.ts)
- Auto-collects: `_ga`, `_fbc`, `_fbp`, `mcmid` from `document.cookie`
- Merged with manual `otherIds`, manual values take precedence
- Refreshed on each event via `refreshCommonCookies()`

## Development Workflow

### Local Development Setup
```bash
# From hclcdp-web-sdk-test directory
./link-cdp-packages.sh    # Creates symlinks to local SDKs
./dev-rebuild.sh          # Rebuilds both SDKs after changes
npm run dev               # Start Next.js dev server
```

**Pattern**: Changes to SDK require rebuild (`npm run build`) because tsup minifies and bundles. Symlinks ensure test app uses local versions.

### Build System
- **tsup**: Bundles TypeScript to CJS + ESM with terser minification
- Dual exports in `package.json`: `import` (ESM) and `require` (CJS)
- `types` field points to `.d.ts` files for TypeScript consumers

### Commit Format (REQUIRED)
Uses Conventional Commits for automated versioning:
- `feat:` → minor bump (1.0.0 → 1.1.0)
- `fix:` → patch bump (1.0.0 → 1.0.1)
- `feat!:` or `BREAKING CHANGE:` → major bump (1.0.0 → 2.0.0)

Validated by husky pre-commit hook and GitHub Actions. **Use imperative mood**: "add" not "added".

## Key Patterns & Conventions

### API Method Naming
- `identify()`: Updates user ID without creating new user session
- `login()`: Updates user ID AND creates new user session
- `logout()`: Clears user ID AND creates new user session

### Runtime Configuration
All config changes apply immediately without reinitialization:
```typescript
HclCdp.setDeviceSessionLogging(true)
HclCdp.setInactivityTimeout(60)
```
Internally updates both config object and SessionManager/CdpClient instances.

### React Integration
- `CdpProvider`: Wraps app, initializes SDK with config
- `useCdp()`: Hook exposing all SDK methods + `isReady` flag
- `useSessionEnd()`: Hook for session lifecycle events (recommended over config callbacks)
- `CdpPageEvent`: Declarative component for automatic page tracking

**Next.js Consideration**: Use `"use client"` directive for all CDP React components (requires browser APIs).

### Session End Callbacks
Three delivery mechanisms (order of execution):
1. Internal SDK callbacks (`onDeviceSessionStart`, `onDeviceSessionEnd`, etc.)
2. Config-provided callbacks (`config.onUserSessionEnd`)
3. Hook callbacks (`useSessionEnd()` in React)

Session end reasons: `"timeout"`, `"login"`, `"logout"`

### Destination Pattern
Plug architecture for third-party integrations:
```typescript
destinations: [{
  id: "GA4",
  classRef: GoogleAnalytics,
  config: { measurementId: "G-XXX" }
}]
```
Classes implement `CdpDestinationHandler` interface with `init()`, `track()`, `page()`, `identify()`.

## Testing & Debugging

### Test App Structure
- `/app/react/page.tsx`: Full-featured demo with session logging UI
- `/app/raw/page.tsx`: Vanilla JS integration example
- Shows real-time identity data, session IDs, localStorage/sessionStorage state

### Console Logging
SDK logs session lifecycle events with emojis:
- ✨ New session created
- 🔄 Session loaded from storage
- ⏰ Session expired
- 🔚 Session ended

### Common Pitfalls
- **Session expiry**: Don't panic - SDK auto-creates new session on next event
- **Config callbacks in React**: Prefer `useSessionEnd()` hook to avoid Next.js serialization issues
- **Missing rebuild**: Changes to SDK require `npm run build` before test app sees them
- **Singleton state**: `HclCdp` static class shares state globally - no multiple instances

## File Organization

### Core SDK (`hclcdp-web-sdk/src/`)
- `HclCdp.ts`: Public API facade
- `CdpClient.ts`: HTTP client, event payload builder
- `SessionManager.ts`: Session lifecycle, timers, storage
- `EventQueue.ts`: Pre-init event queuing
- `types.ts`: Shared TypeScript interfaces
- `destinations/`: Third-party integration classes

### React SDK (`hclcdp-web-sdk-react/src/`)
- `components/CdpProvider.tsx`: Context provider + `useCdp()` hook
- `components/CdpPageEvent.tsx`: Declarative page tracking
- `components/useSessionEnd.tsx`: Session lifecycle hook

### Examples
- `examples/`: CSV mapping docs, sample payloads
- Shows REST API vs JS SDK equivalents

## Release Process

Automated via Release Please GitHub Action:
1. PR merged with conventional commit → Release PR auto-created
2. Release PR includes version bump + CHANGELOG.md update
3. Merge release PR → GitHub release created + npm publish triggered

**Never manually edit**: `CHANGELOG.md`, version numbers (handled automatically).
