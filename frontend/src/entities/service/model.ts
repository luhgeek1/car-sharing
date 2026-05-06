export interface BusinessService {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  long_description: string;
  image_url: string | null;
  inquiry_label: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
