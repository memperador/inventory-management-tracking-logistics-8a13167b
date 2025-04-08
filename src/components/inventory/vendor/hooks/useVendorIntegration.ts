
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WebhookConfigValues, TestStatus } from '../types';

export const useVendorIntegration = () => {
  const [activeTab, setActiveTab] = useState('connect');
  const [apiKey, setApiKey] = useState('');
  const [vendorUrl, setVendorUrl] = useState('');
  const [webhooks, setWebhooks] = useState<WebhookConfigValues[]>([]);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const { toast } = useToast();

  // Load saved webhooks from localStorage
  useEffect(() => {
    const savedWebhooks = localStorage.getItem('vendorWebhooks');
    if (savedWebhooks) {
      try {
        setWebhooks(JSON.parse(savedWebhooks));
      } catch (error) {
        console.error('Error parsing saved webhooks', error);
      }
    }
  }, []);

  // Save webhooks to localStorage when they change
  useEffect(() => {
    if (webhooks.length > 0) {
      localStorage.setItem('vendorWebhooks', JSON.stringify(webhooks));
    }
  }, [webhooks]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendorUrl || !apiKey) {
      toast({
        title: "Validation Error",
        description: "Please provide both API URL and API Key",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Connecting to vendor system:", { apiKey, vendorUrl });
    
    toast({
      title: "Vendor Connection",
      description: "Connection request sent. Check credentials and try again if no confirmation is received.",
    });
  };

  const addWebhook = (webhook: WebhookConfigValues) => {
    setWebhooks(prev => [...prev, { ...webhook, isActive: true }]);
    
    toast({
      title: "Webhook Created",
      description: "Webhook URL has been registered for vendor notifications.",
    });
  };

  const toggleWebhookStatus = (index: number) => {
    setWebhooks(prev => 
      prev.map((webhook, i) => 
        i === index ? { ...webhook, isActive: !webhook.isActive } : webhook
      )
    );
    
    const webhook = webhooks[index];
    toast({
      title: webhook.isActive ? "Webhook Disabled" : "Webhook Enabled",
      description: `${webhook.description || webhook.webhookUrl} has been ${webhook.isActive ? 'disabled' : 'enabled'}.`,
    });
  };

  const deleteWebhook = (index: number) => {
    setWebhooks(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "Webhook Deleted",
      description: "The webhook has been removed from your configuration.",
    });
  };

  const testWebhook = async (webhookUrl: string) => {
    setTestingWebhook(webhookUrl);
    setTestStatus('testing');
    
    try {
      // In a real app, this would send a test payload to the webhook URL
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setTestStatus('success');
      toast({
        title: "Test Successful",
        description: "The webhook responded successfully to the test payload.",
      });
    } catch (error) {
      setTestStatus('error');
      toast({
        title: "Test Failed",
        description: "The webhook did not respond or returned an error.",
        variant: "destructive",
      });
    } finally {
      // Reset the status after a delay
      setTimeout(() => {
        setTestingWebhook(null);
        setTestStatus('idle');
      }, 3000);
    }
  };

  return {
    activeTab,
    setActiveTab,
    apiKey,
    setApiKey,
    vendorUrl,
    setVendorUrl,
    webhooks,
    setWebhooks,
    testingWebhook,
    testStatus,
    handleConnect,
    addWebhook,
    toggleWebhookStatus,
    deleteWebhook,
    testWebhook
  };
};
