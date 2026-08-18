# Social Intelligence Platform

An automated social media intelligence and reporting platform that collects content from social platforms, extracts the original media, analyzes captions and marketing signals using deterministic rules, generates visual reports, and delivers them directly to Telegram.

The system is designed to turn social media monitoring into a repeatable daily intelligence workflow without requiring AI APIs.

---

## Overview

Social media monitoring often requires manually checking accounts, reviewing posts, saving images, identifying marketing patterns, and preparing reports.

This platform automates that workflow:

```text
Social Platforms
      │
      ├── Instagram
      └── TikTok
            │
            ▼
      Content Collection
            │
            ▼
       Media Extraction
            │
            ▼
    Caption & Metadata Analysis
            │
            ▼
      Report Generation
            │
            ▼
       Visual Report
            │
            ▼
          Telegram
```

The generated report contains the **actual collected images and frames**, rather than AI-generated descriptions of them.

---

## Key Features

### Multi-Platform Monitoring

Designed to support:

* Instagram
* TikTok

The platform uses a normalized content model so additional platforms can be integrated without creating a separate reporting system for every platform.

---

### Instagram Content Collection

Supports social content such as:

* Reels
* Images
* Carousel posts

For carousel posts, the original carousel images can be preserved as individual report assets.

For reels/videos, the system extracts representative frames for reporting.

---

### Media Extraction

The system keeps the actual media associated with each post.

For videos:

```text
Video
  ↓
Frame extraction
  ↓
Representative frames
  ↓
Report
```

The current reporting pipeline limits video sampling to a maximum of 5 representative frames.

Carousel posts are treated differently because each carousel image is already an individual piece of content.

---

### Deterministic Content Intelligence

The platform does not require an AI model for its normal analysis pipeline.

Instead, captions, descriptions, hashtags, and metadata are processed using deterministic rules.

Examples of detected signals include:

* Promotional content
* Discounts
* Urgency
* FOMO
* Calls to action
* Engagement prompts
* Educational content
* Giveaways
* Product demonstrations
* Campaign phrases
* Keywords
* Hashtags
* Audience references

For example:

```text
"🔥 30% OFF today only! Shop now."

↓
```

can produce:

```text
Strategy:
Promotional

Urgency:
Today only

Offer:
30% OFF

CTA:
Shop now
```

The system does not invent information when the source content does not support it.

---

## Evidence-Based Reporting

The platform intentionally separates:

### Extracted Data

Information directly obtained from the platform:

* Caption
* Profile
* Post URL
* Publication date
* Media type
* Hashtags
* Platform metadata
* Engagement metrics when available

### Rule-Derived Insights

Signals detected from the available text and metadata:

* Marketing strategy
* CTA
* Promotional language
* Urgency
* Engagement strategy
* Educational signals
* Keywords
* Campaign phrases

### Visual Evidence

The actual downloaded images and extracted frames.

This means the report does not pretend to know what is visible in an image unless the system has reliable structured information supporting that claim.

---

## Visual Reports

Reports combine the extracted content with the actual media.

A typical report contains:

```text
Post Overview
    ↓
Caption
    ↓
Visual Media
    ↓
Content Signals
    ↓
Marketing Analysis
    ↓
Hashtags & Keywords
    ↓
Engagement Metrics
```

Example:

```text
Instagram Analysis — @example

Post Type: REEL
Published: 2026-08-18

Caption:
"30% OFF today only..."

Visual Media:

[ Frame 1 ] [ Frame 2 ] [ Frame 3 ]

[ Frame 4 ] [ Frame 5 ]

Marketing Analysis:

Strategy:
Promotional / Urgency

CTA:
Shop now

Offer:
30% OFF
```

---

## Telegram Delivery

Generated reports can be delivered through Telegram using a configured Telegram bot.

The report generation and Telegram delivery stages are independent.

```text
Report Generated
       ↓
Stored Report
       ↓
TelegramProvider
       ↓
Telegram
```

If Telegram delivery fails, the existing report can be sent again without rerunning:

* Instagram scraping
* media extraction
* analysis
* report generation

This keeps the system idempotent and avoids unnecessary processing.

---

## Daily Automation

The platform is designed around scheduled monitoring.

A typical daily workflow is:

```text
Scheduler
   ↓
Collect new content
   ↓
Skip already processed posts
   ↓
Download/extract media
   ↓
Analyze content
   ↓
Generate reports
   ↓
Create daily summary
   ↓
Send to Telegram
```

Previously processed posts should not be unnecessarily processed again.

---

## Architecture

```text
                    ┌─────────────────┐
                    │    Instagram    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     TikTok      │
                    └────────┬────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │ Content Collector │
                   └─────────┬─────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │  Media Storage    │
                   │ Images / Frames   │
                   └─────────┬─────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │ Deterministic     │
                   │ Content Analyzer  │
                   └─────────┬─────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │ Report Generator  │
                   └─────────┬─────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │ Telegram Provider │
                   └─────────┬─────────┘
                             │
                             ▼
                         Telegram
```

---

## Platform-Normalized Data

The downstream reporting system is designed to work with a common representation of social media content.

Conceptually:

```typescript
interface PlatformPost {
  id: string;
  platform: "instagram" | "tiktok";
  platformPostId: string;
  profileUsername: string;
  mediaType: string;
  publishedAt: string;
  permalink: string;
  caption: string;
  media: MediaAsset[];
  metadata: Record<string, unknown>;
}
```

Media assets are represented independently:

```typescript
interface MediaAsset {
  type: "image" | "video" | "frame";
  path: string;
  index?: number;
  width?: number;
  height?: number;
  mimeType?: string;
}
```

This allows the report generator to remain platform-independent.

---

## TikTok Integration

TikTok integration is designed around the official TikTok developer APIs where applicable.

The intended flow is:

```text
TikTok OAuth
     ↓
Connected Account
     ↓
TikTok Video API
     ↓
Normalized PlatformPost
     ↓
Existing Report Generator
     ↓
Telegram
```

The implementation should respect TikTok API permissions, scopes, rate limits, and media-access limitations.

The system should not depend on undocumented/private TikTok APIs.

---

## Instagram Integration

Instagram content is collected and normalized into the same downstream processing pipeline.

Conceptually:

```text
Instagram
    ↓
Post / Reel / Carousel
    ↓
Media extraction
    ↓
PlatformPost
    ↓
Deterministic analyzer
    ↓
Report
```

Carousel content is preserved as individual media assets.

Reels can be sampled into representative frames for reporting.

---

## No AI Dependency

The normal reporting pipeline does not require:

* NVIDIA NIM
* PaliGemma
* Nemotron
* Gemini
* OpenAI
* other AI APIs

This provides several advantages:

* No model API costs
* No model availability failures
* No API rate-limit dependency
* Predictable results
* Reproducible reports
* Faster processing
* Easier deployment
* Easier debugging

AI can potentially be added later as an optional enrichment layer without changing the core reporting architecture.

---

## Reliability

The system is designed so individual stages can fail independently.

For example:

```text
Scraping
   ↓
Analysis
   ↓
Report
   ↓
Telegram
```

If Telegram fails:

```text
Existing Report
      ↓
Retry Telegram
```

There is no need to rerun the entire pipeline.

Similarly, if report generation fails after content collection:

```text
Stored Content
      ↓
Retry Report Generation
```

---

## Security

Secrets must be provided through environment variables.

Never commit:

```text
TELEGRAM_BOT_TOKEN
TIKTOK_CLIENT_SECRET
TIKTOK_ACCESS_TOKEN
TIKTOK_REFRESH_TOKEN
```

to the repository.

Never log:

* bot tokens
* OAuth access tokens
* refresh tokens
* client secrets
* authorization headers

Example environment configuration:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=
```

Use the environment variables required by the specific enabled integrations.

---

## Telegram Setup

Create a Telegram bot through BotFather and obtain its bot token.

Configure:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

To determine a private chat ID:

1. Start a conversation with the bot.
2. Send `/start`.
3. Query the Telegram Bot API `getUpdates`.
4. Use:

```text
message.chat.id
```

as the chat ID.

Never use the bot token itself as the chat ID.

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd <repository-directory>
```

Install dependencies:

```bash
npm install
```

Create the environment configuration:

```bash
cp .env.example .env
```

Fill in the required credentials.

Start the development server:

```bash
npm run dev
```

Use the project's existing scripts if the names differ.

---

## Environment Variables

### Telegram

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

### TikTok

```env
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=
```

Additional environment variables may be required by the existing application configuration.

Never commit `.env`.

---

## Report Generation

Reports should be generated from stored post data and stored media assets.

The report generator should not re-download media unnecessarily.

Conceptually:

```text
Stored Post
    +
Stored Caption
    +
Stored Metadata
    +
Stored Images / Frames
        ↓
Report Generator
        ↓
HTML / PDF
```

The actual media files are embedded or referenced correctly depending on the report format.

---

## Project Principles

### 1. Evidence over assumptions

If the system does not know something, it should say:

```text
Not identified from available content.
```

rather than inventing an answer.

### 2. Reuse existing media

Do not download or extract the same media multiple times unnecessarily.

### 3. Platform-independent reporting

Instagram and TikTok should feed the same reporting system.

### 4. Independent retries

Scraping, report generation, and Telegram delivery should be independently retryable.

### 5. Minimal architecture

Avoid unnecessary infrastructure and external services.

### 6. Deterministic results

The same input should produce substantially the same analysis.

---

## Future Improvements

Potential future additions include:

* Additional social platforms
* Historical trend analysis
* Cross-platform comparisons
* Competitor monitoring
* Engagement trend dashboards
* Content performance scoring
* Campaign tracking
* Automated weekly reports
* Web dashboard
* Optional AI-based visual enrichment

These should be added without compromising the core deterministic reporting pipeline.

---

## Project Status

### Core Pipeline

* [x] Instagram content collection
* [x] Media extraction
* [x] Frame-based reel reporting
* [x] Carousel media handling
* [x] Deterministic content analysis
* [x] Visual report generation
* [x] Telegram report delivery
* [x] Independent report/Telegram retry flow
* [ ] TikTok integration
* [ ] Cross-platform analytics
* [ ] Historical trend dashboard

Update the status above as individual features are verified in the deployed implementation.

---

## License

Add the project's chosen license here.

For example:

```text
MIT License
```

if the repository is intended to be released under MIT.
