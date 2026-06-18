import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { z } from "zod";
import { APICaller } from "./lib";

export type DefinedRequestContext = {
  axios: AxiosInstance;
  path: string;
  config?: AxiosRequestConfig;
};

export type DefinedRequestExecutor<
  TResponseSchema extends z.ZodType = z.ZodType,
> = (
  context: DefinedRequestContext,
) => Promise<AxiosResponse<z.output<TResponseSchema>>>;

export type DefinedRequest<
  TResponseSchema extends z.ZodType = z.ZodType,
  TTransformed = z.output<TResponseSchema>,
> = {
  readonly key: readonly string[];
  readonly path: string;
  readonly responseSchema?: TResponseSchema;
  readonly execute: DefinedRequestExecutor<TResponseSchema>;
  readonly output?: (data: unknown) => TTransformed;
};

export type DefinedRequestFactory<
  TArgs extends readonly unknown[] = readonly unknown[],
  TResponseSchema extends z.ZodType = z.ZodType,
  TTransformed = z.output<TResponseSchema>,
> = (...args: TArgs) => DefinedRequest<TResponseSchema, TTransformed>;

export type DefinedAPIContractMap = {
  readonly [key: string]: (...args: any[]) => DefinedRequest;
};

export type InferDefinedResponse<T> =
  T extends DefinedRequest<infer TSchema extends z.ZodType, infer TTransformed>
    ? TTransformed
    : unknown;

export type InferDefinedResponseFromFactory<T extends DefinedRequestFactory> =
  InferDefinedResponse<ReturnType<T>>;

export type InferDefinedRequestArgs<T extends DefinedRequestFactory> =
  T extends (...args: infer TArgs extends readonly unknown[]) => DefinedRequest
    ? TArgs
    : never;

export type InferDefinedRequestFromCaller<
  TContract extends DefinedAPIContractMap,
  TKey extends keyof TContract,
  TArgs extends readonly unknown[],
> =
  ReturnType<TContract[TKey]> extends DefinedRequest
    ? TContract[TKey] extends (...args: TArgs) => infer TRequest
      ? TRequest
      : never
    : never;

export type DefinedRequestWithSchema<TSchema extends z.ZodType = z.ZodType> =
  DefinedRequest<TSchema> & { readonly responseSchema: TSchema };

type RequestReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;

export type StrictValidatedContract<T extends DefinedAPIContractMap> = {
  readonly [K in keyof T]: RequestReturnOf<
    T[K]
  > extends DefinedRequestWithSchema
    ? T[K]
    : never;
};

export type DefinedAPIContractConfig<
  TContract extends DefinedAPIContractMap,
  TStrict extends boolean = false,
> = readonly [TContract, APICaller<TStrict>];

export type DefineRequestOptions<
  TResponseSchema extends z.ZodType,
  TTransformed,
> = Omit<DefinedRequest<TResponseSchema, TTransformed>, "path" | "execute">;

export type CallRequest<TStrict extends boolean> = TStrict extends true
  ? DefinedRequest<z.ZodType, unknown> & { responseSchema: z.ZodType }
  : DefinedRequest;
