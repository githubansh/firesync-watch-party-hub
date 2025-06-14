
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tv, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AppSwitcher = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
            FireSync
          </h1>
          <p className="text-gray-300">Choose your device interface</p>
        </div>
        
        <div className="space-y-4">
          <Link to="/firetv" className="block">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-6 text-lg">
              <Tv className="w-6 h-6 mr-3" />
              Fire TV Interface
            </Button>
          </Link>
          
          <Link to="/mobile" className="block">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-6 text-lg">
              <Smartphone className="w-6 h-6 mr-3" />
              Mobile Interface
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
