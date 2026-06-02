export type PlaybackSourceLoadResult<TSource = unknown, TError = Error> =
  | { success: true; source: TSource; path: string }
  | { success: false; error: TError };
