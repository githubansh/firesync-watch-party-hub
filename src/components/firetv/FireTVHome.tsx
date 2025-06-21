import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { Tv, PlusCircle, LogIn } from 'lucide-react';

interface FireTVHomeProps {
  user: User | null;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onNavigateToAuth: () => void;
}

export const FireTVHome = ({ user, onCreateRoom, onJoinRoom, onNavigateToAuth }: FireTVHomeProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Tv size={48} className="text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            FireSync Watch Party
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <p className="text-center text-muted-foreground text-lg">
            Welcome to the next generation of synchronized streaming.
          </p>
          <div className="grid grid-cols-1 gap-4 pt-4">
            <Button
              onClick={onCreateRoom}
              className="w-full py-8 text-xl font-semibold bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/80 transition-all duration-300 transform hover:scale-105 shadow-primary/30"
            >
              <PlusCircle className="mr-4" size={28} />
              Create New Room
            </Button>
            <Button
              onClick={onJoinRoom}
              className="w-full py-8 text-xl font-semibold bg-gradient-to-r from-secondary to-muted hover:from-muted hover:to-secondary transition-all duration-300 transform hover:scale-105"
            >
              <LogIn className="mr-4" size={28} />
              Join Existing Room
            </Button>
          </div>
          {/* {!user && (
            <div className="text-center pt-4">
              <Button variant="link" onClick={onNavigateToAuth} className="text-muted-foreground hover:text-primary">
                Or sign in for more features
              </Button>
            </div>
          )} */}
        </CardContent>
      </Card>
    </div>
  );
}; 