import { useState, useRef } from 'react';
import { BubbleTea, CartItem } from '../types/types';
import { bubbleTeaMenu } from '../data/menu';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { CustomizationDialog } from './CustomizationDialog';
import { useMagnifier } from './MagnifierContext';

interface MenuScreenProps {
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onViewCart: () => void;
  onBack: () => void;
  showImages?: boolean;
}

export function MenuScreen({ cart, onAddToCart, onViewCart, onBack, showImages = true }: MenuScreenProps) {
  const [selectedTea, setSelectedTea] = useState<BubbleTea | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const { setEnabled } = useMagnifier();
  const prevMagnifierStateRef = useRef<boolean>(false);

  const handleSelectTea = (tea: BubbleTea) => {
    setSelectedTea(tea);
    // Store previous magnifier state and disable it while dialog is open
    // We'll restore this state when the dialog closes
    prevMagnifierStateRef.current = true; // mark that we disabled it
    setEnabled(false);
    setShowCustomization(true);
  };

  const handleCloseCustomization = () => {
    setShowCustomization(false);
    // Don't re-enable the magnifier; just close the dialog
    // The user can click the magnifier button if they want it
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10 border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <Button
              onClick={onBack}
              variant="outline"
              size="lg"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
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
      <div className={showImages ? "max-w-7xl mx-auto px-8 py-12" : "w-full px-8 py-12"}>
        <div 
          className={showImages ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "gap-4"} 
          style={!showImages ? { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', width: '100%', gridAutoRows: 'minmax(min-content, max-content)' } : undefined}
        >
          {bubbleTeaMenu.map((tea) => (
            <Card
              key={tea.id}
              className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group flex flex-col"
              onClick={() => handleSelectTea(tea)}
            >
              {showImages && (
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={tea.image}
                    alt={tea.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className={showImages ? "p-4 space-y-2 flex-1 flex flex-col" : "p-3 space-y-2 flex-1 flex flex-col"}>
                <div className="flex items-start justify-between">
                  <h3 className={showImages ? "text-xl" : "text-base font-semibold"}>{tea.name}</h3>
                  <Badge variant="secondary" className="ml-2 bg-accent text-accent-foreground">
                    ${tea.basePrice.toFixed(2)}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">{tea.description}</p>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 mt-auto"
                >
                  {showImages ? "Customize & Add" : "Add"}
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
          onClose={handleCloseCustomization}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
}
