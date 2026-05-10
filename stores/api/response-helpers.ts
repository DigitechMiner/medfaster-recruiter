/** Unwrap `{ data: T }` envelopes on the JSON body (axios `response.data`). */
export function extractData<T>(payload: unknown): T {
  return (payload as { data: T }).data;
}

/** Typed cast when the JSON body is already the expected union/root shape. */
export function extractRoot<T>(payload: unknown): T {
  return payload as T;
}
