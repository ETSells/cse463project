export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSize {
  name: string;
  colors: string[];
}

export interface Product {
  id: string;
  school: string;
  brand: string;
  sponsored?: boolean;
  category: string;
  name: string;
  price: number;
  dealPrice?: number;
  dealLabel?: string;
  image: string;
  imageAlt: string;
  description: string;
  reviews: number;
  colors: ProductColor[];
  sizes: ProductSize[];
}

export interface CartItem {
  key: string;
  product: Product;
  color: string;
  size: string;
  quantity: number;
}
