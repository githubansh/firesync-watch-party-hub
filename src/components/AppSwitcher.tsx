
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tv, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AppSwitcher = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-teal-900 to-slate-900 flex items-center justify-center p-8">
      <Card className="bg-slate-800/80 backdrop-blur-lg border-teal-500/30 p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            FireSync
          </h1>
          <p className="text-gray-300">Choose your device interface</p>
        </div>
        
        <div className="space-y-4">
          <Link to="/firetv" className="block">
            <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white p-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
              <Tv className="w-6 h-6 mr-3" />
              Fire TV Interface
            </Button>
          </Link>
          
          <Link to="/mobile" className="block">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white p-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
              <Smartphone className="w-6 h-6 mr-3" />
              Mobile Interface
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
