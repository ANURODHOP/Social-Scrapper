export interface AIProvider {
    /**
     * Analyze media (image or video) and return structured analysis.
     * @param mediaBuffer - Buffer containing the media data
     * @param mediaType - MIME type of the media (e.g., 'image/jpeg', 'video/mp4')
     * @returns Promise resolving to the analysis result (structured JSON)
     */
    analyzeMedia(mediaBuffer: Buffer, mediaType: string): Promise<any>;
    /**
     * Analyze text (e.g., caption, transcript) and return structured analysis.
     * @param text - The text to analyze
     * @returns Promise resolving to the analysis result (structured JSON)
     */
    analyzeText(text: string): Promise<any>;
}
//# sourceMappingURL=base.d.ts.map