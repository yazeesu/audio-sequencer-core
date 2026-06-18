import { z } from "zod";
import {
  DefineRequestOptions,
  DefinedRequestWithSchema,
  DefinedRequest,
  DefinedRequestExecutor,
  DefinedAPIContractMap,
  DefinedAPIContractConfig,
  StrictValidatedContract,
  CallRequest,
  InferDefinedResponse,
} from "./types";
import axios, { AxiosInstance, AxiosRequestConfig, isAxiosError } from "axios";
import { tryCatch } from "../../utils";
import { APIError, UnsafeResponseError } from "./errors";
import { auth } from "../auth";
import { getSession } from "next-auth/react";

export function defineRequest<TResponseSchema extends z.ZodType>(
  path: string,
  options: DefineRequestOptions<TResponseSchema, z.output<TResponseSchema>> & {
    responseSchema: TResponseSchema;
    output?: undefined;
  },
  execute: DefinedRequestExecutor<TResponseSchema>,
): DefinedRequestWithSchema<TResponseSchema>;

export function defineRequest<TResponseSchema extends z.ZodType>(
  path: string,
  options: DefineRequestOptions<TResponseSchema, z.output<TResponseSchema>> & {
    output?: undefined;
  },
  execute: DefinedRequestExecutor<TResponseSchema>,
): DefinedRequest<TResponseSchema, z.output<TResponseSchema>>;

export function defineRequest<TResponseSchema extends z.ZodType, TTransformed>(
  path: string,
  options: DefineRequestOptions<TResponseSchema, TTransformed> & {
    responseSchema: TResponseSchema;
    output: (data: unknown) => TTransformed;
  },
  execute: DefinedRequestExecutor<TResponseSchema>,
): DefinedRequestWithSchema<TResponseSchema> & {
  readonly output: (data: unknown) => TTransformed;
};

export function defineRequest<TResponseSchema extends z.ZodType, TTransformed>(
  path: string,
  options: DefineRequestOptions<TResponseSchema, TTransformed> & {
    output: (data: unknown) => TTransformed;
  },
  execute: DefinedRequestExecutor<TResponseSchema>,
): DefinedRequest<TResponseSchema, TTransformed>;

export function defineRequest<
  TResponseSchema extends z.ZodType,
  TTransformed = z.output<TResponseSchema>,
>(
  path: string,
  options: DefineRequestOptions<TResponseSchema, TTransformed>,
  execute: DefinedRequestExecutor<TResponseSchema>,
): DefinedRequest<TResponseSchema, TTransformed> {
  return {
    ...options,
    path,
    execute,
  };
}

export function defineAPIContract<
  const TContract extends DefinedAPIContractMap,
>(
  name: string,
  contract: TContract,
  options?: {
    axiosInstance?: AxiosInstance;
    strictMode?: false;
  },
): DefinedAPIContractConfig<TContract, false>;

export function defineAPIContract<
  const TContract extends DefinedAPIContractMap,
>(
  name: string,
  contract: StrictValidatedContract<TContract>,
  options: {
    axiosInstance?: AxiosInstance;
    strictMode: true;
  },
): DefinedAPIContractConfig<TContract, true>;

export function defineAPIContract<
  const TContract extends DefinedAPIContractMap,
>(
  name: string,
  contract: TContract,
  options?: {
    axiosInstance?: AxiosInstance;
    strictMode?: boolean;
  },
): DefinedAPIContractConfig<TContract, boolean> {
  return [
    contract,
    new APICaller(
      name,
      options?.axiosInstance ?? axios,
      options?.strictMode ?? false,
    ),
  ] as const;
}

export class APICaller<TStrict extends boolean = false> {
  constructor(
    private readonly name: string,
    private readonly axiosInstance: AxiosInstance,
    private readonly strictMode: TStrict = false as TStrict,
  ) {}

  async call<TRequest extends CallRequest<TStrict>>(
    request: TRequest,
    extendConfig: AxiosRequestConfig = {},
  ): Promise<InferDefinedResponse<TRequest>> {
    const [result, error] = await tryCatch(
      request.execute({
        axios: this.axiosInstance,
        path: request.path,
        config: extendConfig,
      }),
    );

    if (error) {
      if (isAxiosError(error)) {
        throw new APIError(
          error.response?.data?.message ?? error.message,
          error.response?.status ?? error.status ?? 500,
          error.response?.data,
        );
      }
      throw error;
    }

    const output = request.output ? request.output(result.data) : result.data;

    if (this.strictMode && request.responseSchema) {
      const parsedData = request.responseSchema.safeParse(output);
      if (!parsedData.success) {
        throw new UnsafeResponseError(parsedData.error.message, output);
      }
      return parsedData.data as InferDefinedResponse<TRequest>;
    }

    return output as InferDefinedResponse<TRequest>;
  }

  async server<TRequest extends CallRequest<TStrict>>(
    request: TRequest,
    extendConfig: AxiosRequestConfig = {},
  ): Promise<InferDefinedResponse<TRequest>> {
    const session = await auth();
    return this.call(request, {
      ...extendConfig,
      withCredentials: true,
      headers: {
        ...extendConfig.headers,
        ...(session?.accessToken
          ? { Authorization: `Bearer ${session.accessToken}` }
          : {}),
      },
    });
  }

  async client<TRequest extends CallRequest<TStrict>>(
    request: TRequest,
    extendConfig: AxiosRequestConfig = {},
  ): Promise<InferDefinedResponse<TRequest>> {
    const session = await getSession();
    return this.call(request, {
      ...extendConfig,
      withCredentials: true,
      headers: {
        ...extendConfig.headers,
        ...(session?.accessToken
          ? { Authorization: `Bearer ${session.accessToken}` }
          : {}),
      },
    });
  }
}
