import { GoogleGenAI } from '@google/genai';

export interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  models: string[];
  apiKey: string;
  selectedModel: string;
  isDefault?: boolean;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  text: string;
  error?: string;
}

class AIClient {
  private providers: AIProvider[] = [];
  private activeProviderId: string = '';

  constructor() {
    this.loadProviders();
  }

  private loadProviders() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ai_providers');
      if (stored) {
        try {
          this.providers = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to load providers:', e);
        }
      }
      const activeId = localStorage.getItem('active_provider_id');
      if (activeId) {
        this.activeProviderId = activeId;
      }
    }
  }

  getActiveProvider(): AIProvider | null {
    const provider = this.providers.find(p => p.id === this.activeProviderId);
    if (!provider || !provider.apiKey || !provider.selectedModel) {
      return null;
    }
    return provider;
  }

  getProviders(): AIProvider[] {
    return this.providers;
  }

  setActiveProvider(providerId: string) {
    this.activeProviderId = providerId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_provider_id', providerId);
    }
  }

  async sendMessage(
    systemInstruction: string,
    messages: Message[],
    onProgress?: (chunk: string) => void
  ): Promise<AIResponse> {
    const provider = this.getActiveProvider();
    if (!provider) {
      return {
        text: '',
        error: '请先在设置中配置 AI 助手'
      };
    }

    try {
      // Try to use OpenAI-compatible API first (for most providers)
      if (provider.baseUrl && provider.baseUrl.includes('api')) {
        return await this.callOpenAICompatibleAPI(provider, systemInstruction, messages, onProgress);
      }

      // Fallback to Google GenAI
      return await this.callGoogleGenAI(provider, systemInstruction, messages, onProgress);
    } catch (error) {
      console.error('AI API Error:', error);
      return {
        text: '',
        error: error instanceof Error ? error.message : 'AI 服务调用失败,请检查配置后重试'
      };
    }
  }

  private async callOpenAICompatibleAPI(
    provider: AIProvider,
    systemInstruction: string,
    messages: Message[],
    onProgress?: (chunk: string) => void
  ): Promise<AIResponse> {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: provider.selectedModel,
        messages: [
          { role: 'system', content: systemInstruction },
          ...messages
        ],
        stream: !!onProgress,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
    }

    if (onProgress) {
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                onProgress(content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      return { text: fullText };
    }

    // Handle non-streaming response
    const data = await response.json();
    return {
      text: data.choices?.[0]?.message?.content || ''
    };
  }

  private async callGoogleGenAI(
    provider: AIProvider,
    systemInstruction: string,
    messages: Message[],
    onProgress?: (chunk: string) => void
  ): Promise<AIResponse> {
    const ai = new GoogleGenAI({ apiKey: provider.apiKey });
    const chat = ai.chats.create({
      model: provider.selectedModel,
      config: {
        systemInstruction
      }
    });

    const userMessage = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const response = await chat.sendMessage({ message: userMessage });

    return {
      text: response.text || ''
    };
  }

  isConfigured(): boolean {
    return this.getActiveProvider() !== null;
  }
}

export const aiClient = new AIClient();
