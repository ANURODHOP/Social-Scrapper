import { LocalStorageProvider } from '../providers/storage/local';
import { ReportGenerator } from '../services/report/ReportGenerator';
import { FrameSamplerService } from '../services/frame.sampler.service';
import { NotificationService } from '../services/notification.service';
import { PostRepository } from '../repositories/post.repository';
import { MediaRepository } from '../repositories/media.repository';
import { AnalysisRepository } from '../repositories/analysis.repository';
import { ReportRepository } from '../repositories/report.repository';
import { ProfileRepository } from '../repositories/profile.repository';
import { PipelineTelemetry } from '../types';
export declare class PipelineWorker {
    private readonly storage;
    private readonly frameSampler;
    private readonly reportGenerator;
    private readonly notifications;
    private readonly postRepo;
    private readonly mediaRepo;
    private readonly analysisRepo;
    private readonly reportRepo;
    private readonly profileRepo;
    private readonly telegramChatId;
    constructor(storage: LocalStorageProvider, frameSampler: FrameSamplerService, reportGenerator: ReportGenerator, notifications: NotificationService, postRepo: PostRepository, mediaRepo: MediaRepository, analysisRepo: AnalysisRepository, reportRepo: ReportRepository, profileRepo: ProfileRepository, telegramChatId: string);
    /**
     * Execute the full analysis pipeline for one post.
     * Returns telemetry for the caller to log/persist.
     */
    processPost(postId: string): Promise<PipelineTelemetry>;
    private upsertAnalysis;
}
//# sourceMappingURL=pipeline.worker.d.ts.map