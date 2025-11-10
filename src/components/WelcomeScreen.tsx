import { Button } from './ui/button';
import logo from 'figma:asset/b5d7481338868fab8060868bddef0f79048a537c.png';

interface WelcomeScreenProps {
  onStartOrder: () => void;
}

export function WelcomeScreen({ onStartOrder }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-yellow-50 flex items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="flex justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-lg border-4 border-primary">
            <img src={logo} alt="Machamp Tea House Logo" className="w-64 h-auto" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-6xl text-primary">
            Welcome to Machamp Tea House
          </h1>
        </div>

        <div className="pt-8">
          <Button 
            onClick={onStartOrder}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-12 py-8 text-2xl rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            Start Your Order
          </Button>
        </div>
      </div>
    </div>
  );
}
