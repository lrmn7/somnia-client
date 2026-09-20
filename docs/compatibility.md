# Compatibility Matrix

This document outlines runtime, engine, and dependency compatibility for `somnia-client`.

---

## Runtime & Engine Compatibility

| Environment | Supported Versions | Notes |
|---|---|---|
| **Node.js** | `>= 22.0.0` (22 LTS, 24 LTS) | Required by modern `viem` and `discord.js` 14.x. |
| **Module System** | Pure ESM (`"type": "module"`) | CommonJS `require()` is not supported. Use dynamic `import()` if bridging legacy code. |
| **TypeScript** | `>= 5.0.0` (v5.6 recommended) | Supports `moduleResolution: "bundler"` or `"node16"` / `"nodenext"`. |

---

## Dependency Versions

| Package | Role | Version Range | Notes |
|---|---|---|---|
| `viem` | Direct Dependency | `^2.21.0` | Powers JSON-RPC transport, ABI encoding, and cryptographic primitives. |
| `discord.js` | Peer Dependency | `^14.16.0` | Optional. Required only when importing `somnia-client/discord`. |

---

## Framework Integration

`somnia-client` is designed as a standalone utility library and integrates cleanly into any Discord or backend architecture:

- **discord.js** (Standard Client): Direct integration with slash commands and gateway events.
- **Sapphire Framework**: Can be registered as a container service or piece plugin.
- **Fastify / Express / Hono**: Usable inside HTTP webhook handlers (e.g. Discord Interactions over HTTP without Gateway).
- **Standalone CLI / Daemon Scripts**: Works in any standard Node.js server or cron task.
