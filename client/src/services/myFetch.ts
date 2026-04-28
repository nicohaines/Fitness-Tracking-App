const API_BASE_URL = import.meta.env.VITE_API_ROOT ?? 'http://localhost:3000'

export default function rest<T>(
  url: string,
  data?: unknown,
  options: RequestInit = {},
): Promise<T> {
  options = {
    method: data ? 'POST' : 'GET',

    body: data ? JSON.stringify(data) : undefined,
    ...options,

    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  return fetch(url, options).then((res) => {
    if (!res.ok) {
      if (res.headers.get('Content-Type')?.includes('application/json')) {
        return res.json().then((data) => {
          throw new Error(data.message || 'An error occurred')
        })
      }
      return res.text().then((text) => {
        throw new Error(text)
      })
    }
    return res.json() as Promise<T>
  })
}

export function api<T>(endpoint: string, data?: unknown, options: RequestInit = {}) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return rest<T>(`${API_BASE_URL}${normalizedEndpoint}`, data, options)
}