
import { AIProvider, AIModelConfig, ImageOptions, VideoOptions, GenerationResult, RouterResult } from "../types";
import { AgentId } from "../../../types";
import { getApiBase } from "@/shared/api/api-client";

export class BFFProvider implements AIProvider {
    id = "bff";
    private lastUICommands: any[] = [];

    constructor() {}

    private async callBFF(message: string, sessionKey: string = "nest:default", mediaConfig?: any): Promise<any> {
        console.log("DEBUG: Calling BFF API...", { message, sessionKey, mediaConfig });
        const apiBase = getApiBase();
        const response = await fetch(`${apiBase}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                session_key: sessionKey,
                channel: "canvas",
                chat_id: "ui",
                media_config: mediaConfig
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`BFF API error: ${err}`);
        }

        const data = await response.json();
        console.log("DEBUG: BFF API Data received:", data);
        if (data.error) throw new Error(data.error);

        // Store commands for retrieval after generation
        this.lastUICommands = data.ui_commands || [];

        return data;
    }

    getLastUICommands() {
        const cmds = [...this.lastUICommands];
        this.lastUICommands = []; // Clear after retrieval
        return cmds;
    }

    async generateText(_model: string, prompt: string, _history: any[] = [], _config?: AIModelConfig): Promise<GenerationResult> {
        const data = await this.callBFF(prompt);
        return {
            text: data.response,
            uiCommands: data.ui_commands
        };
    }

    async *generateTextStream(_model: string, prompt: string, _history: any[] = [], _config?: AIModelConfig, _imageContext?: string): AsyncGenerator<string, void, unknown> {
        // Current BFF REST API is unary, so we simulate a single chunk for now
        const data = await this.callBFF(prompt);
        yield data.response;
    }

    async generateImage(prompt: string, options?: ImageOptions): Promise<string> {
        const response = await this.callBFF(prompt, "nest:images", {
            type: 'image',
            aspect_ratio: options?.aspectRatio || '1:1',
            size: options?.size || '1K'
        });
        return response.attachment_url || response.response;
    }

    async generateVideo(prompt: string, options?: VideoOptions, _imageInputBase64?: string): Promise<string> {
        const response = await this.callBFF(prompt, "nest:videos", {
            type: 'video',
            aspect_ratio: options?.aspectRatio || '16:9',
            resolution: options?.resolution || '720p'
        });
        return response.attachment_url || response.response;
    }

    async routeRequest(_prompt: string, _history: any[], _models: { fast: string }, _imageContext?: string): Promise<RouterResult> {
        return {
            targetAgentId: AgentId.NEST,
            reasoning: "Routed through BFF Bridge"
        };
    }
}
