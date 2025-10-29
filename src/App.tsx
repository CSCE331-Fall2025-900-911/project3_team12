import { useState } from 'react';
import { CartItem } from './types/types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MenuScreen } from './components/MenuScreen';
import { CheckoutScreen } from './components/CheckoutScreen';

type Screen = 'welcome' | 'menu' | 'checkout';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleStartOrder = () => {
    setCurrentScreen('menu');
  };

  const handleAddToCart = (item: CartItem) => {
    setCart((prevCart) => {
      // Check if the same item with exact same customizations already exists
      const existingItemIndex = prevCart.findIndex(
        (cartItem) =>
          cartItem.tea.id === item.tea.id &&
          cartItem.customization.size === item.customization.size &&
          cartItem.customization.sugarLevel === item.customization.sugarLevel &&
          JSON.stringify(cartItem.customization.toppings.sort()) ===
            JSON.stringify(item.customization.toppings.sort())
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1,
        };
        return newCart;
      } else {
        // Add new item to cart
        return [...prevCart, item];
      }
    });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const handleViewCart = () => {
    setCurrentScreen('checkout');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };

  const handleCompleteOrder = () => {
    setCart([]);
    setCurrentScreen('welcome');
  };

  return (
    <>
      {currentScreen === 'welcome' && (
        <WelcomeScreen onStartOrder={handleStartOrder} />
      )}
      {currentScreen === 'menu' && (
        <MenuScreen
          cart={cart}
          onAddToCart={handleAddToCart}
          onViewCart={handleViewCart}
        />
      )}
      {currentScreen === 'checkout' && (
        <CheckoutScreen
          cart={cart}
          onBack={handleBackToMenu}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCompleteOrder={handleCompleteOrder}
        />
      )}
    </>
  );
}
