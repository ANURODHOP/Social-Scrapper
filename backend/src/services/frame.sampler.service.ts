// src/services/frame.sampler.service.ts
// Extracts representative frames from a video file using ffmpeg,
// then resizes each frame with sharp to reduce payload size before AI analysis.
// All thresholds and intervals are read from config.

import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ExtractedFrame, } from '../types';
import { FrameSamplingConfig } from '../config/schema';
import logger from '../logger';

interface ProbeData {
  format: { duration?: number };
}

export class FrameSamplerService {
  private readonly cfg: FrameSamplingConfig;
  private readonly maxWidth  = 1280;
  private readonly maxHeight = 720;

  constructor(cfg: FrameSamplingConfig) {
    this.cfg = cfg;
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Extract up to maxFrames representative frames from a video file.
   * Frames are resized to 720p max (to reduce AI payload size).
   */
  async extractFromVideo(videoPath: string): Promise<ExtractedFrame[]> {
    const duration = await this.probeDuration(videoPath);
    const interval = this.pickInterval(duration);
    const timestamps = this.buildTimestamps(duration, interval);

    logger.info(
      `FrameSamplerService: video=${path.basename(videoPath)} duration=${duration.toFixed(1)}s interval=${interval}s → ${timestamps.length} frame(s)`
    );

    const tempDir = await this.makeTempDir();
    try {
      await this.extractFrames(videoPath, timestamps, tempDir);
      return await this.loadAndResize(tempDir, timestamps);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  /**
   * Resize a single image buffer to 720p (for IMAGE posts).
   */
  async resizeImage(imageBuffer: Buffer): Promise<ExtractedFrame> {
    const resized = await sharp(imageBuffer)
      .resize({ width: this.maxWidth, height: this.maxHeight, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const meta = await sharp(resized).metadata();
    return {
      index:            0,
      timestampSeconds: 0,
      buffer:           resized,
      width:            meta.width  ?? this.maxWidth,
      height:           meta.height ?? this.maxHeight,
      sizeBytes:        resized.length,
    };
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────

  private pickInterval(duration: number): number {
    const { shortThreshold, mediumThreshold, shortInterval, mediumInterval, longInterval } = this.cfg;
    if (duration <= shortThreshold)  return shortInterval;
    if (duration <= mediumThreshold) return mediumInterval;
    return longInterval;
  }

  private buildTimestamps(duration: number, interval: number): number[] {
    const stamps: number[] = [];
    for (let t = interval; t < duration; t += interval) {
      stamps.push(parseFloat(t.toFixed(2)));
      if (stamps.length >= this.cfg.maxFrames) break;
    }
    if (stamps.length === 0 && duration > 0) {
      stamps.push(parseFloat((duration / 2).toFixed(2)));
    }
    return stamps;
  }

  private probeDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err: Error | null, data: ProbeData) => {
        if (err) return reject(new Error(`FrameSamplerService.probe: ${err.message}`));
        const dur = data?.format?.duration ?? 0;
        resolve(Number(dur));
      });
    });
  }

  private makeTempDir(): Promise<string> {
    return new Promise((resolve, reject) => {
      const dir = path.join(os.tmpdir(), `frames_${Date.now()}`);
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) return reject(err);
        resolve(dir);
      });
    });
  }

  private extractFrames(videoPath: string, timestamps: number[], outDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps,
          folder:   outDir,
          filename: 'frame-%i.jpg',
        })
        .on('end', () => resolve())
        .on('error', (err: Error) =>
          reject(new Error(`FrameSamplerService.extract: ffmpeg error — ${err.message}`))
        );
    });
  }

  private async loadAndResize(dir: string, timestamps: number[]): Promise<ExtractedFrame[]> {
    const files = fs.readdirSync(dir)
      .filter((f) => f.endsWith('.jpg'))
      .sort();

    const frames: ExtractedFrame[] = [];

    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(dir, files[i]!);
      const raw      = await fs.promises.readFile(filePath);

      const resized  = await sharp(raw)
        .resize({ width: this.maxWidth, height: this.maxHeight, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const meta = await sharp(resized).metadata();

      frames.push({
        index:            i,
        timestampSeconds: timestamps[i] ?? i,
        buffer:           resized,
        width:            meta.width  ?? this.maxWidth,
        height:           meta.height ?? this.maxHeight,
        sizeBytes:        resized.length,
      });
    }

    logger.info(`FrameSamplerService: loaded and resized ${frames.length} frame(s) from ${dir}`);
    return frames;
  }
}
