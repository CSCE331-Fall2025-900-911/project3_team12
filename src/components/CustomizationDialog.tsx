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

  // Reset customization when a new tea is selected
  useEffect(() => {
    setCustomization({
      sugarLevel: 'normal',
      toppings: [],
      size: 'medium',
    });
  }, [tea.id]);

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
      <DialogContent className="max-w-lg max-h-[65vh] p-4 flex flex-col">
      <DialogHeader className="py-3 px-4">
        <DialogTitle className="text-xl font-bold">{tea.name}</DialogTitle>
        <DialogDescription className="text-sm">{tea.description}</DialogDescription>
          </DialogHeader>

          {/* Middle: split area (form | visualizer) */}
          <div className="flex-1 min-h-0">
            <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-6 min-h-0 overflow-hidden">
              {/* Left: form controls (scrollable) */}
                <div className="sm:flex-[0_0_55%] flex-1 overflow-y-auto p-3 space-y-3 min-h-0 pb-14">
              {/* Size Selection */}
              <div className="space-y-3">
              <Label className="text-base font-semibold">Size</Label>
            <RadioGroup
              value={customization.size}
              onValueChange={(value: 'small' | 'medium' | 'large') =>
                setCustomization((prev) => ({ ...prev, size: value }))
              }
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="flex-1 cursor-pointer">
                  Small (+${sizePricing.small.toFixed(2)})
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="flex-1 cursor-pointer">
                  Medium (+${sizePricing.medium.toFixed(2)})
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="flex-1 cursor-pointer">
                  Large (+${sizePricing.large.toFixed(2)})
                </Label>
              </div>
            </RadioGroup>
            </div>

            {/* Sugar Level */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Sugar Level</Label>
              <RadioGroup
                value={customization.sugarLevel}
                onValueChange={(value: Customization['sugarLevel']) =>
                  setCustomization((prev) => ({ ...prev, sugarLevel: value }))
                }
              >
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition">
                  <RadioGroupItem value="no-sugar" id="no-sugar" />
                  <Label htmlFor="no-sugar" className="flex-1 cursor-pointer">
                    No Sugar
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition">
                  <RadioGroupItem value="half-sugar" id="half-sugar" />
                  <Label htmlFor="half-sugar" className="flex-1 cursor-pointer">
                    Half Sugar
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition">
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
              <Label className="text-base font-semibold">Toppings (Select multiple)</Label>
              <div className="space-y-2">
                {availableToppings.map((topping) => (
                  <div
                    key={topping.id}
                    className="flex items-center space-x-3 p-2.9 border rounded-lg hover:bg-gray-50 transition"
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

            {/* close left column */}
            </div>

            {/* Right: visualization pane (separate panel) */}
            <div className="sm:flex-[0_0_45%] flex-1 p-3">
              <div className="border rounded-md shadow-sm bg-white h-full flex flex-col">
                <div className="px-3 py-2 border-b flex items-center justify-between">
                  <h3 className="text-base font-semibold">Preview</h3>
                  {/* placeholder for future controls (pop-out, zoom) */}
                  <div className="text-xs text-muted-foreground">Live</div>
                </div>

                <div className="flex-1 p-4 flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center">
                    <DrinkVisualizer tea={tea} customization={customization} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (sticky) */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm z-20 border-t flex items-center justify-between py-3 px-4">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">${calculateTotal().toFixed(2)}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="text-sm py-2 h-9">
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              className="bg-primary hover:bg-primary/90 text-sm py-2 h-9"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
