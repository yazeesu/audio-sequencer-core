export class APIError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: any,
  ) {
    super(message);
  }
}

export class UnsafeResponseError extends Error {
  constructor(
    message: string,
    public readonly data: any,
  ) {
    super(message);
  }
}
