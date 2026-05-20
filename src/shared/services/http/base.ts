import axios, { AxiosInstance } from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export abstract class APIService {
  constructor(protected readonly axiosInstance: AxiosInstance) {}
}

export class APIError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: any,
  ) {
    super(message);
  }
}
