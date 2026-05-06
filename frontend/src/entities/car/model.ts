export type CarCategory =
  | "luxury"
  | "performance"
  | "suv"
  | "sedan"
  | "electric";

export const CAR_CATEGORIES: { value: CarCategory; label: string }[] = [
  { value: "luxury", label: "Luxury" },
  { value: "performance", label: "Performance" },
  { value: "suv", label: "SUV" },
  { value: "sedan", label: "Sedan" },
  { value: "electric", label: "Electric" },
];

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  description: string;
  images: string[];
  price_per_day: string | number;
  highlights: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface CarCreatePayload {
  name: string;
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  description: string;
  images: string[];
  price_per_day: number;
  highlights: string[];
  is_available: boolean;
}

export type CarUpdatePayload = Partial<CarCreatePayload>;

export interface CarListResponse {
  items: Car[];
  total: number;
}
