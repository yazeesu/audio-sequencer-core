import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { APIError, APIService, axiosInstance } from "./base";
import { tryCatch } from "../../utils";
import { SongData } from "../../types";

export class SongsRequestService extends APIService {
  constructor(axiosInstance: AxiosInstance) {
    super(axiosInstance);
  }

  async getSongs(): Promise<SongData[]> {
    const [data, error] = await tryCatch<AxiosResponse<SongData[]>, AxiosError>(
      this.axiosInstance.get("/songs"),
    );
    if (error) {
      throw new APIError(
        error.message,
        error.status ?? 500,
        error.response?.data ?? null,
      );
    }
    return data.data;
  }

  async getSong(songId: string) {
    const [data, error] = await tryCatch<AxiosResponse<SongData>, AxiosError>(
      this.axiosInstance.get(`/songs/${songId}`),
    );
    if (error) {
      throw new APIError(
        error.message,
        error.status ?? 500,
        error.response?.data ?? null,
      );
    }
    return data.data;
  }
}

export const songsRequestService = new SongsRequestService(axiosInstance);
