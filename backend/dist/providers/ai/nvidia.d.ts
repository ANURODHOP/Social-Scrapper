import { AIProvider } from './base';
export declare class NVIDIAProvider implements AIProvider {
    private readonly endpoint;
    private readonly model;
    constructor(apiKey: string, endpoint?: string, model?: string);
    analyzeMedia(_mediaBuffer: Buffer, _mediaType: string): Promise<unknown>;
    analyzeText(_text: string): Promise<unknown>;
}
//# sourceMappingURL=nvidia.d.ts.map