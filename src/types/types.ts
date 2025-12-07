export interface BubbleTea {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  category: 'milk-tea' | 'fruit-tea' | 'specialty';
  calories: number;
  sugar: number;
  protein: number;
}

export interface Customization {
  sugarLevel: 'no-sugar' | 'half-sugar' | 'normal';
  toppings: string[];
  size: 'small' | 'medium' | 'large';
}

export interface CartItem {
  id: string;
  tea: BubbleTea;
  customization: Customization;
  quantity: number;
}
