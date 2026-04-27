export type DataEnvelope<T> = {
  data: T,
  isSuccess: boolean,
  message?: string,
}

export type DataListEnvelope<T> = DataEnvelope<T[]> & {
    total: number,
}