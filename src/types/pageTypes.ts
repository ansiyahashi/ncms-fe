// Base search params that are common across all pages
export type BaseSearchParams = {
  q?: string
  page?: string
  'per-page'?: string
}

// Generic search params type that can be extended by each page
export type SearchParamsType<T extends Record<string, string | undefined> = Record<string, string | undefined>> =
  Promise<BaseSearchParams & T>

export type PageProps<
  TSearchParams extends Record<string, string | undefined> = Record<string, string | undefined>,
  TParams = Record<string, string>
> = {
  searchParams?: SearchParamsType<TSearchParams>
  params?: Promise<TParams>
}
