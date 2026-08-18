"use strict";
// src/types/index.ts
// Shared domain types used across services, workers, and routes.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.fail = fail;
function ok(data) {
    return { success: true, data };
}
function fail(error, code) {
    return { success: false, error, code };
}
//# sourceMappingURL=index.js.map