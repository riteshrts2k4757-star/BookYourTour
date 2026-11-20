type TransportSearchResponse<T> = {
  data?: T;
  message?: string;
  details?: string;
};

export async function readTransportSearchResponse<T>(
  response: Response
): Promise<TransportSearchResponse<T>> {
  const body = await response.text();
  let payload: TransportSearchResponse<T>;

  try {
    payload = body ? JSON.parse(body) as TransportSearchResponse<T> : {};
  } catch {
    if (!response.ok) {
      throw new Error(body.trim() || `Transport request failed with status ${response.status}.`);
    }

    throw new Error(`Transport service returned an invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(
      payload.message ||
      payload.details ||
      `Transport request failed with status ${response.status}.`
    );
  }

  return payload;
}
