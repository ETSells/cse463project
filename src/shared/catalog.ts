import type { Product } from './types';

const base = import.meta.env.BASE_URL;

export async function loadCatalog(): Promise<Product[]> {
  const response = await fetch(`${base}shop-data/catalog.json`);
  if (!response.ok) throw new Error('The local shop catalog could not be loaded.');
  return (await response.json()) as Product[];
}

export function productImage(image: string): string {
  return `${base}${image}`;
}
