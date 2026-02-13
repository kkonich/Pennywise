export class HttpError extends Error {
  public readonly status: number

  public constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type RequestOptions = {
  signal?: AbortSignal
}

export async function getJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(path, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: options.signal,
  })

  if (!response.ok) {
    const message = `Request failed with status ${response.status}`
    throw new HttpError(response.status, message)
  }

  return (await response.json()) as T
}
