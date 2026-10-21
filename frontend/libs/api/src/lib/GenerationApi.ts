import { t as uiText } from "@storyteller/common";
import { ApiManager } from "./ApiManager.js";

export interface EnqueueGenerationResult {
  success: boolean;
  jobToken?: string;
  error?: string;
}

export class GenerationApi extends ApiManager {
  public async Enqueue(
    endpoint: string,
    body: Record<string, unknown>,
  ): Promise<EnqueueGenerationResult> {
    const fullEndpoint = `${this.getApiSchemeAndHost()}${endpoint}`;

    return this.post<Record<string, unknown>, {
      success: boolean;
      inference_job_token?: string;
      BadInput?: string;
    }>({ endpoint: fullEndpoint, body })
      .then((response) => {
        if (response.success && response.inference_job_token) {
          return { success: true, jobToken: response.inference_job_token };
        }
        return {
          success: false,
          error: response.BadInput ?? uiText("common.generation.failed"),
        };
      })
      .catch((err) => ({
        success: false,
        error: err.message ?? uiText("desktop.request.failed"),
      }));
  }
}
