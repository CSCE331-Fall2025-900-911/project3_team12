import { useState } from 'react';
import { CartItem } from '../types/types';
import { availableToppings, sizePricing } from '../data/menu';
import { ordersApi } from '../services/api';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ArrowLeft, Trash2, Plus, Minus, CheckCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface CheckoutScreenProps {
  cart: CartItem[];
  onBack: () => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCompleteOrder: () => void;
}

export function CheckoutScreen({
  cart,
  onBack,
  onUpdateQuantity,
  onRemoveItem,
  onCompleteOrder,
}: CheckoutScreenProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  const calculateItemTotal = (item: CartItem) => {
    let total = item.tea.basePrice;
    total += sizePricing[item.customization.size];
    item.customization.toppings.forEach((toppingId) => {
      const topping = availableToppings.find((t) => t.id === toppingId);
      if (topping) total += topping.price;
    });
    return total * item.quantity;
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCompleteOrder = async () => {
    setIsSubmitting(true);
    setOrderError(null);

    try {
      // Transform cart items to match API format
      const orderItems = cart.map((item) => ({
        menuItemId: item.tea.id,
        itemName: item.tea.name,
        quantity: item.quantity,
        size: item.customization.size,
        sugarLevel: item.customization.sugarLevel,
        iceLevel: item.customization.iceLevel,
        toppings: item.customization.toppings,
        price: calculateItemTotal(item),
      }));

      // Create order in database
      await ordersApi.create({
        items: orderItems,
        totalPrice: calculateTotal(),
      });

      // Show success confirmation
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error creating order:', error);
      setOrderError(
        error instanceof Error 
          ? error.message 
          : 'Failed to create order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (item: CartItem) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onRemoveItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setItemToDelete(null);
  };

  const handleConfirmOrder = () => {
    setShowConfirmation(false);
    setOrderError(null);
    onCompleteOrder();
  };

  const getToppingNames = (toppingIds: string[]) => {
    return toppingIds
      .map((id) => availableToppings.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-yellow-50">
      {/* Translate Button */}
      <button
        onClick={() => {
          // call the function we exposed in index.html
          (window as any).showGoogleTranslateUI?.();
          // also ensure the container is visible (defensive)
          const el = document.getElementById('google_translate_element');
          if (el) el.style.display = 'block';
        }}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          backgroundColor: '#facc15',
          color: '#000',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 9999,
        }}
      >
        Translate
      </button>

      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-primary">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Button>
          <h1 className="text-3xl text-primary">Your Cart</h1>
          <p className="text-muted-foreground">Review your order</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {cart.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xl text-muted-foreground mb-6">Your cart is empty</p>
            <Button
              onClick={onBack}
              className="bg-primary hover:bg-primary/90"
            >
              Browse Menu
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.tea.image}
                        alt={item.tea.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl">{item.tea.name}</h3>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <Badge variant="secondary">
                              {item.customization.size.charAt(0).toUpperCase() + item.customization.size.slice(1)}
                            </Badge>
                            <Badge variant="secondary">
                              Sugar: {item.customization.sugarLevel === 'no-sugar' ? 'No Sugar' : item.customization.sugarLevel === 'half-sugar' ? 'Half Sugar' : 'Normal'}
                            </Badge>
                            <Badge variant="secondary">
                              Ice: {item.customization.iceLevel.charAt(0).toUpperCase() + item.customization.iceLevel.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(item)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {item.customization.toppings.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Toppings: {getToppingNames(item.customization.toppings)}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-lg">${calculateItemTotal(item).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <Card className="p-6 bg-white border-2 border-primary/20">
              <h3 className="text-xl mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {orderError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm text-center">{orderError}</p>
                </div>
              )}

              <Button
                onClick={handleCompleteOrder}
                disabled={isSubmitting}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-lg py-6"
              >
                {isSubmitting ? 'Processing...' : 'Complete Order'}
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Order Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-accent/30 p-4 rounded-full border-4 border-accent">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-2xl">
              Order Confirmed!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg">
              Thank you for your order. Your bubble tea will be ready shortly!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 bg-secondary rounded-lg border-2 border-primary/20">
            <p className="text-primary text-center">Order Total: ${calculateTotal().toFixed(2)}</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleConfirmOrder}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Start New Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Item Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open: boolean) => !open && handleCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{itemToDelete?.tea.name}" from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Remove
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
