import { apiPublic } from "./axiosInstance";
import type { BusinessService } from "@/entities/service/model";

export const listServices = async (): Promise<BusinessService[]> => {
  const { data } = await apiPublic.get<BusinessService[]>("/services/");
  return data;
};
