import { localizeError } from "@storyteller/common";

export function commandErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const command = error as {
      error_message?: string;
      error_details?: { error_message?: string };
      message?: string;
    };
    return localizeError(
      command.error_message ??
      command.error_details?.error_message ??
      command.message ??
      fallback
    );
  }
  return localizeError(typeof error === "string" ? error : fallback);
}
