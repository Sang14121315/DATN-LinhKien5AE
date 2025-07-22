export interface Product {
  _id: string;
  name: string;
  price: number;
  img_url: string;
  stock: number;
}

export interface Brand {
  _id: string;
  slug: string;
  name: string;
  logo_data?: string; // Base64 image data
  logo_url?: string;
  parent?: string | { _id: string; name: string } | null;
  created_at?: string;
  updated_at?: string;
}
