import { useState } from 'react';
import { BubbleTea, Customization, CartItem } from '../types/types';
import { availableToppings, sizePricing } from '../data/menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { useEffect } from 'react';
import DrinkVisualizer from './DrinkVisualizer';

// Let TypeScript know Google Translate adds a global object
declare global {
  interface Window {
    google?: any;
  }
}

interface CustomizationDialogProps {
  tea: BubbleTea;
  open: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export function CustomizationDialog({
  tea,
  open,
  onClose,
  onAddToCart,
}: CustomizationDialogProps) {
  const [customization, setCustomization] = useState<Customization>({
    sugarLevel: 'normal',
    toppings: [],
    size: 'medium',
  });

  useEffect(() => {
    if (open && window.google && window.google.translate) {
      setTimeout(() => {
        const element = document.getElementById('google_translate_element');
        if (element) {
          element.innerHTML = '';
          new window.google.translate.TranslateElement(
            { pageLanguage: 'en' },
            'google_translate_element'
          );
        }
      }, 300);
    }
  }, [open]);

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: `${tea.id}-${Date.now()}`,
      tea,
      customization,
      quantity: 1,
    };
    onAddToCart(cartItem);
    onClose();
    // Reset customization for next order
    setCustomization({
      sugarLevel: 'normal',
      toppings: [],
      size: 'medium',
    });
  };

  const handleToggleTopping = (toppingId: string) => {
    setCustomization((prev) => ({
      ...prev,
      toppings: prev.toppings.includes(toppingId)
        ? prev.toppings.filter((t) => t !== toppingId)
        : [...prev.toppings, toppingId],
    }));
  };

  const calculateTotal = () => {
    let total = tea.basePrice;
    total += sizePricing[customization.size];
    customization.toppings.forEach((toppingId) => {
      const topping = availableToppings.find((t) => t.id === toppingId);
      if (topping) total += topping.price;
    });
    return total;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{tea.name}</DialogTitle>
          <DialogDescription>{tea.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Visualizer */}
          <div className="flex justify-center">
            <DrinkVisualizer tea={tea} customization={customization} />
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <Label className="text-lg">Size</Label>
            <RadioGroup
              value={customization.size}
              onValueChange={(value: 'small' | 'medium' | 'large') =>
                setCustomization((prev) => ({ ...prev, size: value }))
              }
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="flex-1 cursor-pointer">
                  Small (+${sizePricing.small.toFixed(2)})
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="flex-1 cursor-pointer">
                  Medium (+${sizePricing.medium.toFixed(2)})
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="flex-1 cursor-pointer">
                  Large (+${sizePricing.large.toFixed(2)})
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Sugar Level */}
          <div className="space-y-3">
            <Label className="text-lg">Sugar Level</Label>
            <RadioGroup
              value={customization.sugarLevel}
              onValueChange={(value: Customization['sugarLevel']) =>
                setCustomization((prev) => ({ ...prev, sugarLevel: value }))
              }
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="no-sugar" id="no-sugar" />
                <Label htmlFor="no-sugar" className="flex-1 cursor-pointer">
                  No Sugar
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="half-sugar" id="half-sugar" />
                <Label htmlFor="half-sugar" className="flex-1 cursor-pointer">
                  Half Sugar
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal" className="flex-1 cursor-pointer">
                  Normal
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Toppings */}
          <div className="space-y-3">
            <Label className="text-lg">Toppings (Select multiple)</Label>
            <div className="space-y-2">
              {availableToppings.map((topping) => (
                <div
                  key={topping.id}
                  className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    id={topping.id}
                    checked={customization.toppings.includes(topping.id)}
                    onCheckedChange={() => handleToggleTopping(topping.id)}
                  />
                  <Label
                    htmlFor={topping.id}
                    className="flex-1 cursor-pointer flex justify-between"
                  >
                    <span>{topping.name}</span>
                    <span className="text-gray-600">+${topping.price.toFixed(2)}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl">${calculateTotal().toFixed(2)}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              className="bg-primary hover:bg-primary/90"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
