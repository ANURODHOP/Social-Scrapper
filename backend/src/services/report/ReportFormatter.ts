import { DeterministicAnalysisResult } from './ReportAnalyzer';


import fs from 'fs';
import path from 'path';

export interface ReportInput {
  analysis: DeterministicAnalysisResult;
  caption: string | null;
  username: string | null;
  platform: string;
  permalink: string;
  publishedAt: Date | null;
  frames: string[]; // Absolute or relative paths to the frames
}

export class ReportFormatter {
  public formatHtml(input: ReportInput): string {
    const { analysis, caption, username, platform, permalink, publishedAt, frames } = input;
    
    // Map frames to html strings with base64 data URIs
    const frameHtml = frames.map((f, i) => {
      let srcUrl = '';
      try {
        if (fs.existsSync(f)) {
          const ext = path.extname(f).toLowerCase() === '.png' ? 'png' : 'jpeg';
          const base64 = fs.readFileSync(f).toString('base64');
          srcUrl = `data:image/${ext};base64,${base64}`;
        }
      } catch (err) {
        // Fallback or ignore
      }
      
      return `
      <div class="frame">
        <h4>Frame ${i + 1}</h4>
        ${srcUrl ? `<img src="${srcUrl}" alt="Frame ${i + 1}" style="max-width: 100%; height: auto;" />` : `<p>Missing frame</p>`}
      </div>
    `;
    }).join('\\n');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Deterministic Instagram Intelligence Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #2c3e50; }
    .section { margin-bottom: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; }
    .frames-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    .frame { text-align: center; }
    .tag { display: inline-block; background: #3498db; color: white; padding: 4px 8px; border-radius: 4px; margin: 2px; font-size: 0.9em; }
    .tag-empty { background: #95a5a6; }
    pre { white-space: pre-wrap; font-family: inherit; }
  </style>
</head>
<body>
  <h1>INSTAGRAM CONTENT INTELLIGENCE</h1>
  
  <div class="section">
    <h2>POST OVERVIEW</h2>
    <p><strong>Account:</strong> @${username || 'Unknown'}</p>
    <p><strong>Platform:</strong> ${platform}</p>
    <p><strong>Published Date:</strong> ${publishedAt ? publishedAt.toISOString() : 'Unknown'}</p>
    <p><strong>Post URL:</strong> <a href="${permalink}">${permalink}</a></p>
    <h3>Caption</h3>
    <pre>${caption || 'No caption'}</pre>
  </div>

  <div class="section">
    <h2>VISUAL CONTENT</h2>
    <div class="frames-gallery">
      ${frameHtml || '<p>No frames extracted.</p>'}
    </div>
  </div>

  <div class="section">
    <h2>CONTENT SIGNALS</h2>
    <p><strong>Brand:</strong> ${analysis.brand}</p>
    <p><strong>Category:</strong> ${analysis.category.join(', ')}</p>
    <p><strong>Hashtags:</strong> ${analysis.hashtags.all.join(', ') || 'None'}</p>
  </div>

  <div class="section">
    <h2>MARKETING ANALYSIS</h2>
    <p><strong>Marketing Strategy:</strong> ${analysis.marketingStrategy.join(', ')}</p>
    <p><strong>Hook:</strong> ${analysis.hook}</p>
    <p><strong>Call To Action:</strong> ${analysis.callToAction}</p>
    <p><strong>Promotional Signals:</strong> ${analysis.promotions.join(', ') || 'None'}</p>
    <p><strong>Urgency Signals:</strong> ${analysis.urgency.join(', ') || 'None'}</p>
    <p><strong>Engagement Strategy:</strong> ${analysis.engagementStrategy.join(', ') || 'None'}</p>
    <p><strong>Emotional Signal:</strong> ${analysis.emotionalSignal}</p>
  </div>

  <div class="section">
    <h2>AUDIENCE</h2>
    <p>${analysis.audience}</p>
  </div>
  
  <div class="section">
    <h2>SUMMARY</h2>
    <p>This post is analyzed deterministically. The detected marketing strategies include ${analysis.marketingStrategy.join(' and ')}. 
    The primary call to action identified is "${analysis.callToAction}". 
    Target audience explicitly mentioned: ${analysis.audience}.</p>
  </div>

</body>
</html>
    `.trim();
  }
}
