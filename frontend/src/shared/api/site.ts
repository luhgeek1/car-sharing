import { apiPublic } from "./axiosInstance";
import type { SiteContent } from "@/entities/site/model";

export const getSiteContent = async (): Promise<SiteContent> => {
  const { data } = await apiPublic.get<SiteContent>("/site/content");
  return data;
};
