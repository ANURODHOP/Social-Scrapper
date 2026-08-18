"use strict";
// src/providers/social/instagram.client.interface.ts
// Abstraction over how Instagram data is actually acquired.
// The InstagramProvider depends ONLY on this interface.
//
// Concrete implementations:
//   - InstagramGraphApiClient   (official Graph API — requires approved app)
//   - InstagramInstatusClient   (third-party API wrapper)
//   - InstagramPlaywrightClient (browser automation — for authorized accounts)
//
// Implement a concrete client and inject it into InstagramProvider.
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=instagram.client.interface.js.map