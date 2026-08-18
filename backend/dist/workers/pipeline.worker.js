"use strict";
// src/workers/pipeline.worker.ts
// Full sequential processing pipeline for a single post.
// Steps: Load media → Extract frames → NVIDIA analysis → Report → Telegram.
// Exhaustive Winston telemetry throughout.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineWorker = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("../logger"));
class PipelineWorker {
    constructor(storage, frameSampler, reportGenerator, notifications, postRepo, mediaRepo, analysisRepo, reportRepo, profileRepo, telegramChatId) {
        this.storage = storage;
        this.frameSampler = frameSampler;
        this.reportGenerator = reportGenerator;
        this.notifications = notifications;
        this.postRepo = postRepo;
        this.mediaRepo = mediaRepo;
        this.analysisRepo = analysisRepo;
        this.reportRepo = reportRepo;
        this.profileRepo = profileRepo;
        this.telegramChatId = telegramChatId;
    }
    /**
     * Execute the full analysis pipeline for one post.
     * Returns telemetry for the caller to log/persist.
     */
    async processPost(postId) {
        const tel = {
            postId,
            profileUsername: 'unknown',
            platform: 'unknown',
            startedAt: new Date(),
            bytesDownloaded: 0,
            framesExtracted: 0,
            retryCount: 0,
        };
        const pipelineStart = Date.now();
        logger_1.default.info(`PipelineWorker: starting pipeline for post ${postId}`);
        try {
            // ── Step 1: Load post + profile ──────────────────────────────────────
            const post = await this.postRepo.findById(postId);
            if (!post)
                throw new Error(`PipelineWorker: post ${postId} not found`);
            const profile = await this.profileRepo.findById(post.profileId);
            if (!profile)
                throw new Error(`PipelineWorker: profile ${post.profileId} not found`);
            tel.profileUsername = profile.username;
            tel.platform = profile.platform;
            logger_1.default.info(`PipelineWorker[${post.id}]: post=${post.platformId} profile=@${profile.username}`);
            // ── Step 2: Resolve media on disk ────────────────────────────────────
            const mediaItems = await this.mediaRepo.getMediaForPost(postId);
            if (mediaItems.length === 0) {
                throw new Error(`PipelineWorker: no media records found for post ${postId}`);
            }
            let framePaths = [];
            const isCarousel = mediaItems.length > 1 || post.mediaType.toUpperCase() === 'CAROUSEL_ALBUM';
            const framesDir = this.storage.buildStructuredPath(profile.platform, profile.username, postId, 'representative_frames');
            if (isCarousel) {
                // Use all media items for carousel
                for (let i = 0; i < mediaItems.length; i++) {
                    const media = mediaItems[i];
                    const originalFile = media.mediaFiles.find((f) => f.fileType === 'original');
                    if (!originalFile)
                        continue;
                    const diskPath = path_1.default.join(process.cwd(), 'storage', originalFile.filePath);
                    if (fs_1.default.existsSync(diskPath)) {
                        framePaths.push(diskPath);
                        try {
                            const rawBuffer = await fs_1.default.promises.readFile(diskPath);
                            tel.bytesDownloaded = (tel.bytesDownloaded || 0) + rawBuffer.length;
                        }
                        catch (err) { }
                    }
                }
                tel.framesExtracted = framePaths.length;
                logger_1.default.info(`PipelineWorker[${postId}]: Carousel detected, found ${framePaths.length} media items`);
            }
            else {
                // Process single media item (Video or Image)
                const primaryMedia = mediaItems[0];
                const originalFile = primaryMedia.mediaFiles.find((f) => f.fileType === 'original');
                if (!originalFile) {
                    throw new Error(`PipelineWorker: no original_media file found for post ${postId}`);
                }
                const diskPath = path_1.default.join(process.cwd(), 'storage', originalFile.filePath);
                if (!fs_1.default.existsSync(diskPath)) {
                    throw new Error(`PipelineWorker: file not on disk — ${diskPath}`);
                }
                const rawBuffer = await fs_1.default.promises.readFile(diskPath);
                tel.bytesDownloaded = rawBuffer.length;
                logger_1.default.info(`PipelineWorker[${postId}]: loaded ${rawBuffer.length} bytes from ${diskPath}`);
                // ── Step 3: Extract / resize frames ──────────────────────────────────
                let frameBuffers;
                const isVideo = primaryMedia.mediaType.toUpperCase() === 'VIDEO';
                if (isVideo) {
                    const aiStart = Date.now();
                    const frames = await this.frameSampler.extractFromVideo(diskPath);
                    tel.framesExtracted = frames.length;
                    frameBuffers = frames.map((f) => f.buffer);
                    logger_1.default.info(`PipelineWorker[${postId}]: extracted ${frames.length} frames in ${Date.now() - aiStart}ms`);
                    for (let i = 0; i < frames.length; i++) {
                        const framePath = path_1.default.join(framesDir, `frame_${String(i + 1).padStart(3, '0')}.jpg`);
                        await this.storage.upload(frames[i].buffer, framePath);
                        await this.mediaRepo.createMediaFile({
                            mediaId: primaryMedia.id,
                            fileType: 'frame',
                            filePath: framePath,
                            fileSize: frames[i].sizeBytes,
                            width: frames[i].width,
                            height: frames[i].height,
                        });
                    }
                }
                else {
                    const frame = await this.frameSampler.resizeImage(rawBuffer);
                    tel.framesExtracted = 1;
                    frameBuffers = [frame.buffer];
                    logger_1.default.info(`PipelineWorker[${postId}]: resized image → ${frame.sizeBytes} bytes`);
                }
                for (let i = 0; i < Math.min(5, frameBuffers.length); i++) {
                    framePaths.push(path_1.default.join(framesDir, `frame_${String(i + 1).padStart(3, '0')}.jpg`));
                }
            }
            // ── Step 4: Deterministic Report Generation ────────────────────────────────────────
            logger_1.default.info(`PipelineWorker[${postId}]: Generating deterministic report`);
            const aiStart = Date.now();
            const report = this.reportGenerator.generateReport({
                permalink: post.permalink ?? '',
                caption: post.caption,
                platform: profile.platform,
                username: profile.username,
                publishedAt: post.publishedAt,
                frames: framePaths
            });
            tel.aiLatencyMs = Date.now() - aiStart;
            logger_1.default.info(`PipelineWorker[${postId}]: Deterministic report generated in ${tel.aiLatencyMs}ms`);
            // ── Step 5: Persist analysis to DB ────────────────────────────────────
            const dbAnalysis = await this.upsertAnalysis(postId, report.analysisResult);
            logger_1.default.info(`PipelineWorker[${postId}]: analysis saved → ${dbAnalysis.id}`);
            // Persist analysis.json to structured storage
            const analysisPath = this.storage.buildStructuredPath(profile.platform, profile.username, postId, 'analysis.json');
            await this.storage.upload(Buffer.from(JSON.stringify(report.analysisResult, null, 2)), analysisPath);
            // ── Step 6: Generate report ───────────────────────────────────────────
            // Already generated above, so we just use it.
            // Persist MD + HTML to structured storage
            const mdPath = this.storage.buildStructuredPath(profile.platform, profile.username, postId, 'report.md');
            const htmlPath = this.storage.buildStructuredPath(profile.platform, profile.username, postId, 'report.html');
            await this.storage.upload(Buffer.from(report.markdown, 'utf8'), mdPath);
            await this.storage.upload(Buffer.from(report.html, 'utf8'), htmlPath);
            // Persist to DB
            await this.reportRepo.upsert({
                postId,
                profileId: profile.id,
                type: 'comprehensive',
                format: 'markdown',
                title: report.title,
                content: report.markdown,
                filePath: mdPath,
            });
            logger_1.default.info(`PipelineWorker[${postId}]: reports saved`);
            // ── Step 7: Telegram notification ─────────────────────────────────────
            const tgStart = Date.now();
            await this.notifications.sendReportToTelegram({
                chatId: this.telegramChatId,
                markdown: report.markdown,
                postId,
                profileId: profile.id,
                documentPath: path_1.default.join(process.cwd(), 'storage', htmlPath),
            });
            tel.telegramLatencyMs = Date.now() - tgStart;
            logger_1.default.info(`PipelineWorker[${postId}]: Telegram sent in ${tel.telegramLatencyMs}ms`);
            // ── Step 8: Mark post as processed ────────────────────────────────────
            await this.postRepo.update(postId, { isProcessed: true });
            tel.finishedAt = new Date();
            tel.durationMs = Date.now() - pipelineStart;
            logger_1.default.info(`PipelineWorker[${postId}]: ✅ pipeline complete in ${tel.durationMs}ms`, {
                bytesDownloaded: tel.bytesDownloaded,
                framesExtracted: tel.framesExtracted,
                aiLatencyMs: tel.aiLatencyMs,
                telegramLatencyMs: tel.telegramLatencyMs,
            });
            return tel;
        }
        catch (err) {
            tel.error = err instanceof Error ? err.message : String(err);
            tel.durationMs = Date.now() - pipelineStart;
            logger_1.default.error(`PipelineWorker[${postId}]: ❌ pipeline failed after ${tel.durationMs}ms`, { error: tel.error });
            throw err;
        }
    }
    // ─── Private Helpers ─────────────────────────────────────────────────────
    async upsertAnalysis(postId, result) {
        const existing = await this.analysisRepo.findByPostId(postId);
        const data = {
            productIdentification: null,
            brand: result.brand,
            category: result.category.join(', '),
            campaign: null,
            targetAudience: result.audience,
            marketingStrategy: result.marketingStrategy.join(', '),
            primaryMessage: result.primaryMessage,
            hook: result.hook,
            callToAction: result.callToAction,
            visualStyle: 'Not identified deterministically',
            colorPalette: undefined,
            emotion: result.emotionalSignal,
            sceneDescriptions: undefined,
            objects: undefined,
            people: undefined,
            speechSummary: null,
            captionSummary: null,
            hashtags: JSON.stringify(result.hashtags.all),
            keywords: undefined,
            competitorInsights: undefined,
            postingStrategy: null,
            overallConfidence: 1.0,
            rawMetadata: undefined,
        };
        if (existing) {
            return this.analysisRepo.update(existing.id, data);
        }
        return this.analysisRepo.create({ postId, ...data });
    }
}
exports.PipelineWorker = PipelineWorker;
//# sourceMappingURL=pipeline.worker.js.map