
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface AuthPageProps {
  onBack: () => void;
  onAuthenticated: () => void;
}

export const AuthPage = ({ onBack, onAuthenticated }: AuthPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        onAuthenticated();
      }
    });

    return () => subscription.unsubscribe();
  }, [onAuthenticated]);

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Account created successfully. You can now sign in.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to FireSync</h2>
          <p className="text-gray-400">Sign in to start your watch party</p>
        </div>

        <Tabs defaultValue="signin" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="signin" className="text-white data-[state=active]:bg-orange-500">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-white data-[state=active]:bg-orange-500">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <div>
              <Label htmlFor="signin-email" className="text-white">Email</Label>
              <div className="relative mt-2">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="signin-password" className="text-white">Password</Label>
              <div className="relative mt-2">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                />
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <div>
              <Label htmlFor="signup-email" className="text-white">Email</Label>
              <div className="relative mt-2">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="signup-password" className="text-white">Password</Label>
              <div className="relative mt-2">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                />
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              onClick={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </TabsContent>
        </Tabs>

        <Button 
          variant="outline" 
          className="w-full mt-6 border-white/20 text-white hover:bg-white/10"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </Card>
    </div>
  );
};
