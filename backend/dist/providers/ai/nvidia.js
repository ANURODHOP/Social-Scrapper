"use strict";
// src/providers/ai/nvidia.ts
// NVIDIA NIM AI provider.
// Implements the AIProvider interface using NVIDIA's inference API.
// Uses axios for HTTP — no NVIDIA-specific SDK required.
//
// TODO Phase 8: implement analyzeMedia and analyzeText with real NVIDIA NIM calls.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NVIDIAProvider = void 0;
const logger_1 = __importDefault(require("../../logger"));
class NVIDIAProvider {
    constructor(apiKey, endpoint, model) {
        if (!apiKey) {
            throw new Error('NVIDIAProvider: apiKey is required');
        }
        this.endpoint = endpoint ?? 'https://integrate.api.nvidia.com/v1';
        this.model = model ?? 'meta/llama-3.1-70b-instruct';
        const maskedKey = apiKey.substring(0, 4) + '...';
        logger_1.default.info(`NVIDIAProvider: initialized [endpoint=${this.endpoint}, model=${this.model}, key=${maskedKey}]`);
    }
    async analyzeMedia(_mediaBuffer, _mediaType) {
        logger_1.default.warn('NVIDIAProvider.analyzeMedia: not yet implemented (Phase 8)');
        // TODO: Convert media to base64, POST to NVIDIA vision endpoint
        throw new Error('NVIDIAProvider.analyzeMedia: implementation pending (Phase 8)');
    }
    async analyzeText(_text) {
        logger_1.default.warn('NVIDIAProvider.analyzeText: not yet implemented (Phase 8)');
        // TODO: POST to NVIDIA chat completions endpoint
        throw new Error('NVIDIAProvider.analyzeText: implementation pending (Phase 8)');
    }
}
exports.NVIDIAProvider = NVIDIAProvider;
//# sourceMappingURL=nvidia.js.map