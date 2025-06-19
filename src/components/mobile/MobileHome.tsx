
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tv, Smartphone, Users, LogOut, User } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface MobileHomeProps {
  user: SupabaseUser | null;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onSignOut: () => void;
}

export const MobileHome = ({ user, onCreateRoom, onJoinRoom, onSignOut }: MobileHomeProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-teal-900 to-slate-900 flex flex-col items-center justify-center p-8">
      <Card className="bg-slate-800/80 backdrop-blur-lg border-teal-500/30 p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            FireSync
          </h1>
          <p className="text-gray-300">Mobile Remote Control</p>
          {user && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
              <User className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <Button 
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white p-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={onCreateRoom}
          >
            <Tv className="w-6 h-6 mr-3" />
            Host Watch Party
          </Button>
          
          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white p-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={onJoinRoom}
          >
            <Smartphone className="w-6 h-6 mr-3" />
            Join Party
          </Button>

          {!user && (
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-4 mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-teal-400" />
                <span className="font-semibold text-white">Sign In Required</span>
              </div>
              <p className="text-sm text-gray-300">
                Create an account to host watch parties or join existing ones with your family.
              </p>
            </div>
          )}

          {user && (
            <Button 
              variant="outline"
              className="w-full border-teal-500/30 text-teal-400 hover:bg-teal-500/10 mt-6"
              onClick={onSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
