export interface ProductColor {
  name: string;
  hex: string;
  available: boolean;
}

export interface Product {
  id: string;
  school: string;
  category: string;
  name: string;
  price: number;
  image: string;
  imageAlt: string;
  description: string;
  reviews: number;
  colors: ProductColor[];
  sizes: string[];
}

export interface CartItem {
  key: string;
  product: Product;
  color: string;
  size: string;
  quantity: number;
}
