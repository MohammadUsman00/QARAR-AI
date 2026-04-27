type ApiErrorBody = {
  error?: string;
  message?: string;
  details?: { message?: string }[];
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_json: "The request could not be read. Please refresh and try again.",
  validation_error: "Please check the form. One or more fields need attention.",
  rate_limited: "You have reached the short-term AI request limit. Please try again later.",
  limit_reached: "You have reached your plan limit. Upgrade to continue.",
  timeout: "The AI request took too long. Please try again in a moment.",
  provider_error: "The AI service is temporarily unavailable. Please try again.",
  parse_error: "The AI response could not be processed. Please try again.",
  crisis_detected:
    "This sounds urgent and outside what Qarar should analyze. If there is any immediate danger, contact local emergency services or a trusted person now.",
};

export function apiErrorMessage(body: ApiErrorBody, status?: number): string {
  if (body.message) return body.message;

  if (body.error && ERROR_MESSAGES[body.error]) {
    return ERROR_MESSAGES[body.error];
  }

  const firstDetail = body.details?.find((detail) => detail.message)?.message;
  if (firstDetail) return firstDetail;

  if (status === 401) return "Please sign in again to continue.";
  if (status === 403) return "You do not have access to this action.";
  if (status === 429) return ERROR_MESSAGES.rate_limited;
  if (status === 504) return ERROR_MESSAGES.timeout;

  return "Something went wrong. Please try again.";
}
