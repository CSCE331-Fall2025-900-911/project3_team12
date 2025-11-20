import { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CartItem } from './types/types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MenuScreen } from './components/MenuScreen';
import { CheckoutScreen } from './components/CheckoutScreen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ManagerHeader } from './components/ManagerHeader';
import { ManagerDashboard } from './components/ManagerDashboard';
import { ManagerDashboardSimple } from './components/ManagerDashboardSimple';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import Magnifier from './components/Magnifier';
import { MagnifierProvider } from './components/MagnifierContext';
import { Button } from './components/ui/button';

type Screen = 'welcome' | 'menu' | 'checkout';
type AppMode = 'kiosk' | 'manager';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [appMode, setAppMode] = useState<AppMode>('kiosk');
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

  const toggleAppMode = () => {
    setAppMode((prev) => (prev === 'kiosk' ? 'manager' : 'kiosk'));
    setCurrentScreen('welcome');
    setCart([]);
  };

  // Get Google Client ID from environment variable
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <MagnifierProvider>
          <>
            <Magnifier />
                  <div className="fixed top-6 left-6 z-50">
                    <Button
                    onClick={toggleAppMode}
                    variant="outline"
                    className="shadow-lg px-6 py-3"
                    >
                {appMode === 'kiosk' ? 'Manager Mode' : 'Kiosk Mode'}
              </Button>
            </div>

            {appMode === 'kiosk' ? (
              // Kiosk Mode - Original App
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
            ) : (
              // Manager Mode - Protected
              <ErrorBoundary>
                <ProtectedRoute>
                  <ManagerDashboard />
                </ProtectedRoute>
              </ErrorBoundary>
            )}
          </>
        </MagnifierProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
