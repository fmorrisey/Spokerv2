export interface Response<T> {
    allRequestResponses: any[]
    body: T
    duration: number
    headers: { [key: string]: string | string[] }
    isOkStatusCode: boolean
    redirects?: string[]
    redirectedToUrl?: string
    requestHeaders: { [key: string]: string }
    status: number
    statusText: string
  }