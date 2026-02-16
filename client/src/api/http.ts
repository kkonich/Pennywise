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

type JsonRequestOptions = RequestOptions & {
  body: unknown
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

export async function putJson(path: string, options: JsonRequestOptions): Promise<void> {
  const response = await fetch(path, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options.body),
    signal: options.signal,
  })

  if (!response.ok) {
    const message = `Request failed with status ${response.status}`
    throw new HttpError(response.status, message)
  }
}
