// src/providers/social/instagram.http.client.ts
// Headless Playwright implementation of InstagramClient to bypass public rate limits.
// (Named InstagramHTTPClient to preserve existing interface and scheduler injection)
// We navigate to the profile and intercept the GraphQL responses directly from the network.

import { chromium } from 'playwright';
import { InstagramClient, RawInstagramMedia, RawInstagramProfile } from './instagram.client.interface';
import logger from '../../logger';

const IG_WEB_BASE = 'https://www.instagram.com';

export class InstagramHTTPClient implements InstagramClient {
  private readonly timeoutMs: number;

  constructor(timeoutSeconds = 30) {
    this.timeoutMs = timeoutSeconds * 1000;
    logger.info('InstagramHTTPClient: initialized (headless interception via Playwright)');
  }

  // ─── getProfile ─────────────────────────────────────────────────────────────
  async getProfile(username: string): Promise<RawInstagramProfile> {
    logger.info(`InstagramHTTPClient.getProfile: ${username}`);
    const data = await this.scrapeData(username, 'profile');
    
    if (!data.profile) {
      throw new Error(`InstagramHTTPClient.getProfile: empty profile response for "${username}"`);
    }

    const u = data.profile;
    const followed = u.edge_followed_by as { count?: number } | undefined;
    const following = u.edge_follow as { count?: number } | undefined;

    return {
      id:                  String(u.id),
      username:            String(u.username ?? username),
      name:                u.full_name ? String(u.full_name) : undefined,
      biography:           u.biography ? String(u.biography) : undefined,
      followers_count:     followed?.count,
      following_count:     following?.count,
      profile_picture_url: (u.profile_pic_url_hd ?? u.profile_pic_url) as string | undefined,
    };
  }

  // ─── validateProfile ─────────────────────────────────────────────────────────
  async validateProfile(username: string): Promise<boolean> {
    try {
      await this.getProfile(username);
      return true;
    } catch {
      return false;
    }
  }

  // ─── getRecentMedia ──────────────────────────────────────────────────────────
  async getRecentMedia(profileId: string, limit = 50): Promise<RawInstagramMedia[]> {
    logger.info(`InstagramHTTPClient.getRecentMedia: profileId=${profileId} limit=${limit}`);
    
    // In our system, profileId is currently the string username (e.g., 'fabriziorom').
    const data = await this.scrapeData(profileId, 'timeline');
    
    if (!data.timeline) {
      logger.warn(`InstagramHTTPClient.getRecentMedia: no timeline data intercepted for ${profileId}`);
      return [];
    }

    const timeline = data.timeline.user as Record<string, unknown> | undefined;
    const edges = (timeline?.edge_owner_to_timeline_media as { edges?: unknown[] } | undefined)?.edges;

    if (!Array.isArray(edges)) {
      logger.warn(`InstagramHTTPClient.getRecentMedia: no media edges for profileId=${profileId}`);
      return [];
    }

    return edges.slice(0, limit).map((e) => this.mapEdgeToMedia(e as Record<string, unknown>));
  }

  // ─── getMediaDownloadUrl ─────────────────────────────────────────────────────
  async getMediaDownloadUrl(mediaId: string): Promise<string | null> {
    logger.warn(`InstagramHTTPClient.getMediaDownloadUrl: standalone lookup not supported without auth. mediaId=${mediaId}`);
    return null;
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private async scrapeData(username: string, mode: 'profile' | 'timeline') {
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      const page = await context.newPage();

      let profileData: any = null;
      let timelineData: any = null;

      page.on('response', async (response) => {
        try {
          const url = response.url();
          if (url.includes('api/v1/users/web_profile_info') || url.includes('/graphql/query')) {
            const json = await response.json();
            if (json.data && json.data.user) {
              if (url.includes('web_profile_info')) {
                profileData = json.data.user;
              }
              if (json.data.user.edge_owner_to_timeline_media) {
                timelineData = json.data;
              }
            }
          }
        } catch (e) {
          // Ignore parsing errors for other requests
        }
      });

      // Navigate and wait for the page to load
      await page.goto(`${IG_WEB_BASE}/${username}/`, { waitUntil: 'domcontentloaded', timeout: this.timeoutMs }).catch(() => {});
      
      // Wait up to 10 seconds for the desired network responses
      for (let i = 0; i < 20; i++) {
        if (mode === 'profile' && profileData) break;
        if (mode === 'timeline' && timelineData) break;
        await page.waitForTimeout(500);
      }
      
      return { profile: profileData, timeline: timelineData };
    } finally {
      await browser.close();
    }
  }

  private mapEdgeToMedia(edge: Record<string, unknown>): RawInstagramMedia {
    const n = edge.node as Record<string, unknown>;
    const isVideo = Boolean(n.is_video);
    const sidecar = n.edge_sidecar_to_children as { edges?: unknown[] } | undefined;
    const captionEdges = (n.edge_media_to_caption as { edges?: unknown[] } | undefined)?.edges;
    const caption = (
      (captionEdges?.[0] as Record<string, unknown>)?.node as Record<string, unknown>
    )?.text as string | undefined;

    const mediaType: RawInstagramMedia['media_type'] =
      isVideo ? 'VIDEO' : sidecar?.edges ? 'CAROUSEL_ALBUM' : 'IMAGE';

    const children: RawInstagramMedia[] | undefined = sidecar?.edges?.map((c): RawInstagramMedia => {
      const cn = (c as Record<string, unknown>).node as Record<string, unknown>;
      return {
        id:          String(cn.id),
        media_type:  Boolean(cn.is_video) ? 'VIDEO' : 'IMAGE',
        media_url:   (cn.video_url ?? cn.display_url) as string | undefined,
        permalink:   `${IG_WEB_BASE}/p/${String(n.shortcode)}/`,
        timestamp:   new Date((n.taken_at_timestamp as number) * 1000).toISOString(),
      };
    });

    return {
      id:            String(n.id),
      media_type:    mediaType,
      media_url:     (n.video_url ?? n.display_url) as string | undefined,
      thumbnail_url: n.thumbnail_url as string | undefined,
      permalink:     `${IG_WEB_BASE}/p/${String(n.shortcode)}/`,
      caption,
      timestamp:     new Date((n.taken_at_timestamp as number) * 1000).toISOString(),
      children,
    };
  }
}
