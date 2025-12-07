import { useState } from 'react';
import { BubbleTea, CartItem, Customization } from '../types/types';
import { bubbleTeaMenu } from '../data/menu';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart } from 'lucide-react';
import { CustomizationDialog } from './CustomizationDialog';
import { useMagnifier } from './MagnifierContext';

interface MenuScreenProps {
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onViewCart: () => void;
}

export function MenuScreen({ cart, onAddToCart, onViewCart }: MenuScreenProps) {
  const [selectedTea, setSelectedTea] = useState<BubbleTea | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customization, setCustomization] = useState<Customization>({
    sugarLevel: 'normal',
    toppings: [],
    size: 'medium',
  });
  const { setEnabled } = useMagnifier();

  const handleSelectTea = (tea: BubbleTea) => {
    setSelectedTea(tea);
    // disable magnifier while customization dialog is open
    setEnabled(false);
    setShowCustomization(true);
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10 border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-primary">Machamp Tea House</h1>
            <p className="text-muted-foreground">Select your bubble tea</p>
          </div>
          <Button
            onClick={onViewCart}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white relative"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            View Cart
            {cartItemCount > 0 && (
              <Badge className="ml-2 bg-destructive hover:bg-destructive/90">
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bubbleTeaMenu.map((tea) => (
            <Card
              key={tea.id}
              className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
              onClick={() => handleSelectTea(tea)}
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={tea.image}
                  alt={tea.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl">{tea.name}</h3>
                  <Badge variant="secondary" className="ml-2 bg-accent text-accent-foreground">
                    ${tea.basePrice.toFixed(2)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{tea.description}</p>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Customize & Add
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Customization Dialog */}
      {selectedTea && (
        <CustomizationDialog
          tea={selectedTea}
          open={showCustomization}
          onClose={() => {
            setShowCustomization(false);
            setEnabled(true);
          }}
          onAddToCart={onAddToCart}
          customization={customization}
          setCustomization={setCustomization}
        />
      )}
    </div>
  );
}
