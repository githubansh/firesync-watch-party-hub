
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-8">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
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
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-6 text-lg"
            onClick={onCreateRoom}
          >
            <Tv className="w-6 h-6 mr-3" />
            Host Watch Party
          </Button>
          
          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-6 text-lg"
            onClick={onJoinRoom}
          >
            <Smartphone className="w-6 h-6 mr-3" />
            Join Party
          </Button>

          {!user && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
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
              className="w-full border-white/20 text-white hover:bg-white/10 mt-6"
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
