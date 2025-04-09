
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

interface AuthTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onForgotPassword: () => void;
  onSignupComplete: (email: string) => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ 
  activeTab, 
  setActiveTab, 
  onForgotPassword,
  onSignupComplete 
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <LoginForm onForgotPassword={onForgotPassword} />
      </TabsContent>
      
      <TabsContent value="signup">
        <SignupForm onSignupComplete={onSignupComplete} />
      </TabsContent>
    </Tabs>
  );
};

export default AuthTabs;
