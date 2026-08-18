import { ExtractedFrame } from '../types';
import { FrameSamplingConfig } from '../config/schema';
export declare class FrameSamplerService {
    private readonly cfg;
    private readonly maxWidth;
    private readonly maxHeight;
    constructor(cfg: FrameSamplingConfig);
    /**
     * Extract up to maxFrames representative frames from a video file.
     * Frames are resized to 720p max (to reduce AI payload size).
     */
    extractFromVideo(videoPath: string): Promise<ExtractedFrame[]>;
    /**
     * Resize a single image buffer to 720p (for IMAGE posts).
     */
    resizeImage(imageBuffer: Buffer): Promise<ExtractedFrame>;
    private pickInterval;
    private buildTimestamps;
    private probeDuration;
    private makeTempDir;
    private extractFrames;
    private loadAndResize;
}
//# sourceMappingURL=frame.sampler.service.d.ts.map