import { HydraApiConfig, HydraApiResponse, ClientInput, HydraNodeState } from '../types/hydra';

export class HydraApiClient {
  private config: HydraApiConfig;

  constructor(config: HydraApiConfig) {
    this.config = config;
  }

  updateConfig(config: HydraApiConfig) {
    this.config = config;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<HydraApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 5000);

      const response = await fetch(`${this.config.url}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async testConnection(): Promise<HydraApiResponse> {
    return this.makeRequest('/health');
  }

  async getNodeState(): Promise<HydraApiResponse<HydraNodeState>> {
    return this.makeRequest('/state');
  }

  async sendCommand(command: ClientInput): Promise<HydraApiResponse> {
    return this.makeRequest('/command', 'POST', command);
  }

  async getUtxos(): Promise<HydraApiResponse<any[]>> {
    return this.makeRequest('/utxos');
  }

  async getParties(): Promise<HydraApiResponse<string[]>> {
    return this.makeRequest('/parties');
  }

  async getHeadId(): Promise<HydraApiResponse<string>> {
    return this.makeRequest('/head-id');
  }

  async getSnapshot(): Promise<HydraApiResponse<any>> {
    return this.makeRequest('/snapshot');
  }
}

// Default configuration
export const defaultHydraConfig: HydraApiConfig = {
  url: 'http://localhost:4001',
  timeout: 5000
};
