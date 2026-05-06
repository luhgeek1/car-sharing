import apiProtected, { apiPublic } from "./axiosInstance";
import axios from "axios";
import type {
  Car,
  CarCategory,
  CarCreatePayload,
  CarListResponse,
  CarUpdatePayload,
} from "@/entities/car/model";

export interface ListCarsParams {
  category?: CarCategory;
  is_available?: boolean;
  limit?: number;
  offset?: number;
}

export const listCars = async (
  params: ListCarsParams = {},
): Promise<CarListResponse> => {
  const { data } = await apiPublic.get<CarListResponse>("/cars/", { params });
  return data;
};

export const getCar = async (id: string): Promise<Car> => {
  const { data } = await apiPublic.get<Car>(`/cars/${id}`);
  return data;
};

export const createCar = async (payload: CarCreatePayload): Promise<Car> => {
  const { data } = await apiProtected.post<Car>("/admins/cars/", payload);
  return data;
};

export const updateCar = async (
  id: string,
  payload: CarUpdatePayload,
): Promise<Car> => {
  const { data } = await apiProtected.patch<Car>(`/admins/cars/${id}`, payload);
  return data;
};

export const deleteCar = async (id: string): Promise<void> => {
  await apiProtected.delete(`/admins/cars/${id}`);
};

interface CarImagePresign {
  object_key: string;
  upload_url: string;
  public_url: string;
  expires_in: number;
}

export const uploadCarImage = async (file: File): Promise<string> => {
  const { data } = await apiProtected.post<CarImagePresign>(
    "/admins/cars/upload-presign",
    {
      filename: file.name,
      content_type: file.type || "image/jpeg",
    },
  );

  await axios.put(data.upload_url, file, {
    headers: { "Content-Type": file.type || "image/jpeg" },
  });

  return data.public_url;
};
