"use strict";
// src/services/frame.sampler.service.ts
// Extracts representative frames from a video file using ffmpeg,
// then resizes each frame with sharp to reduce payload size before AI analysis.
// All thresholds and intervals are read from config.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameSamplerService = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const logger_1 = __importDefault(require("../logger"));
class FrameSamplerService {
    constructor(cfg) {
        this.maxWidth = 1280;
        this.maxHeight = 720;
        this.cfg = cfg;
    }
    // ─── Public API ──────────────────────────────────────────────────────────
    /**
     * Extract up to maxFrames representative frames from a video file.
     * Frames are resized to 720p max (to reduce AI payload size).
     */
    async extractFromVideo(videoPath) {
        const duration = await this.probeDuration(videoPath);
        const interval = this.pickInterval(duration);
        const timestamps = this.buildTimestamps(duration, interval);
        logger_1.default.info(`FrameSamplerService: video=${path_1.default.basename(videoPath)} duration=${duration.toFixed(1)}s interval=${interval}s → ${timestamps.length} frame(s)`);
        const tempDir = await this.makeTempDir();
        try {
            await this.extractFrames(videoPath, timestamps, tempDir);
            return await this.loadAndResize(tempDir, timestamps);
        }
        finally {
            fs_1.default.rmSync(tempDir, { recursive: true, force: true });
        }
    }
    /**
     * Resize a single image buffer to 720p (for IMAGE posts).
     */
    async resizeImage(imageBuffer) {
        const resized = await (0, sharp_1.default)(imageBuffer)
            .resize({ width: this.maxWidth, height: this.maxHeight, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
        const meta = await (0, sharp_1.default)(resized).metadata();
        return {
            index: 0,
            timestampSeconds: 0,
            buffer: resized,
            width: meta.width ?? this.maxWidth,
            height: meta.height ?? this.maxHeight,
            sizeBytes: resized.length,
        };
    }
    // ─── Private Helpers ─────────────────────────────────────────────────────
    pickInterval(duration) {
        const { shortThreshold, mediumThreshold, shortInterval, mediumInterval, longInterval } = this.cfg;
        if (duration <= shortThreshold)
            return shortInterval;
        if (duration <= mediumThreshold)
            return mediumInterval;
        return longInterval;
    }
    buildTimestamps(duration, interval) {
        const stamps = [];
        for (let t = interval; t < duration; t += interval) {
            stamps.push(parseFloat(t.toFixed(2)));
            if (stamps.length >= this.cfg.maxFrames)
                break;
        }
        if (stamps.length === 0 && duration > 0) {
            stamps.push(parseFloat((duration / 2).toFixed(2)));
        }
        return stamps;
    }
    probeDuration(videoPath) {
        return new Promise((resolve, reject) => {
            fluent_ffmpeg_1.default.ffprobe(videoPath, (err, data) => {
                if (err)
                    return reject(new Error(`FrameSamplerService.probe: ${err.message}`));
                const dur = data?.format?.duration ?? 0;
                resolve(Number(dur));
            });
        });
    }
    makeTempDir() {
        return new Promise((resolve, reject) => {
            const dir = path_1.default.join(os_1.default.tmpdir(), `frames_${Date.now()}`);
            fs_1.default.mkdir(dir, { recursive: true }, (err) => {
                if (err)
                    return reject(err);
                resolve(dir);
            });
        });
    }
    extractFrames(videoPath, timestamps, outDir) {
        return new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)(videoPath)
                .screenshots({
                timestamps,
                folder: outDir,
                filename: 'frame-%i.jpg',
            })
                .on('end', () => resolve())
                .on('error', (err) => reject(new Error(`FrameSamplerService.extract: ffmpeg error — ${err.message}`)));
        });
    }
    async loadAndResize(dir, timestamps) {
        const files = fs_1.default.readdirSync(dir)
            .filter((f) => f.endsWith('.jpg'))
            .sort();
        const frames = [];
        for (let i = 0; i < files.length; i++) {
            const filePath = path_1.default.join(dir, files[i]);
            const raw = await fs_1.default.promises.readFile(filePath);
            const resized = await (0, sharp_1.default)(raw)
                .resize({ width: this.maxWidth, height: this.maxHeight, fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 85 })
                .toBuffer();
            const meta = await (0, sharp_1.default)(resized).metadata();
            frames.push({
                index: i,
                timestampSeconds: timestamps[i] ?? i,
                buffer: resized,
                width: meta.width ?? this.maxWidth,
                height: meta.height ?? this.maxHeight,
                sizeBytes: resized.length,
            });
        }
        logger_1.default.info(`FrameSamplerService: loaded and resized ${frames.length} frame(s) from ${dir}`);
        return frames;
    }
}
exports.FrameSamplerService = FrameSamplerService;
//# sourceMappingURL=frame.sampler.service.js.map