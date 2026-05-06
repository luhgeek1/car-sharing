import apiProtected, { apiPublic } from "./axiosInstance";

export interface CreateContactRequestPayload {
  full_name: string;
  phone: string;
  email: string;
  service_slug: string | null;
  service_label: string;
  vehicle_type: string;
  preferred_date: string;
  message: string;
}

export interface ContactRequest {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  service_slug: string | null;
  service_label: string;
  vehicle_type: string;
  preferred_date: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export interface ContactRequestListResponse {
  items: ContactRequest[];
  next_cursor: string | null;
  total: number;
}

export interface ListContactRequestsParams {
  service_slug?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}

export const createContactRequest = async (
  payload: CreateContactRequestPayload,
): Promise<void> => {
  await apiPublic.post("/contact-requests/", payload);
};

export const listAdminContactRequests = async (
  params: ListContactRequestsParams = {},
): Promise<ContactRequestListResponse> => {
  const { data } = await apiProtected.get<ContactRequestListResponse>(
    "/admins/contact-requests/",
    { params },
  );
  return data;
};
