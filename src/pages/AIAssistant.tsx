import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import TradeAssist from '@/components/ai/TradeAssist';
import TieredAIAssistant from '@/components/ai/TieredAIAssistant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, HelpCircle, Sparkles } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Separator } from '@/components/ui/separator';

const AIAssistant = () => {
  const { currentTier } = useFeatureAccess();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="TradeAssist AI"
        description="Your intelligent inventory and asset tracking advisor"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="assistant">
            <TabsList>
              <TabsTrigger value="assistant" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span>Assistant</span>
              </TabsTrigger>
              <TabsTrigger value="help" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>Help & Examples</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="assistant" className="mt-4">
              <TradeAssist />
            </TabsContent>
            
            <TabsContent value="help" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Using TradeAssist AI</CardTitle>
                  <CardDescription>
                    How to get the most out of your inventory management assistant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium">Commands</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          TradeAssist responds to these specialized commands:
                        </p>
                        <div className="space-y-3">
                          <div className="border-l-4 border-primary pl-4 py-1">
                            <p className="font-mono font-medium">/analyze-inventory</p>
                            <p className="text-sm text-muted-foreground">
                              Get an analysis of your current inventory patterns, identifying overstocked and understocked items.
                            </p>
                          </div>
                          <div className="border-l-4 border-primary pl-4 py-1">
                            <p className="font-mono font-medium">/track-recommendation</p>
                            <p className="text-sm text-muted-foreground">
                              Receive tailored recommendations for RFID, GPS, and QR code tracking based on your equipment profile.
                            </p>
                          </div>
                          <div className="border-l-4 border-primary pl-4 py-1">
                            <p className="font-mono font-medium">/compliance-check</p>
                            <p className="text-sm text-muted-foreground">
                              Check your equipment against relevant industry codes and certification requirements.
                            </p>
                          </div>
                          <div className="border-l-4 border-primary pl-4 py-1">
                            <p className="font-mono font-medium">/project-prep [project ID]</p>
                            <p className="text-sm text-muted-foreground">
                              Generate a recommended equipment and material list for a specific project.
                            </p>
                          </div>
                          <div className="border-l-4 border-primary pl-4 py-1">
                            <p className="font-mono font-medium">/help</p>
                            <p className="text-sm text-muted-foreground">
                              View a list of available commands and capabilities.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Example Questions</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Try asking TradeAssist these questions:
                        </p>
                        <ul className="space-y-2 list-disc pl-5">
                          <li className="text-sm">"What tracking solution is best for my power tools?"</li>
                          <li className="text-sm">"How can I optimize my inventory of electrical components?"</li>
                          <li className="text-sm">"What equipment needs compliance attention this month?"</li>
                          <li className="text-sm">"What's the difference between active and passive RFID?"</li>
                          <li className="text-sm">"Which equipment should I allocate to the downtown project?"</li>
                          <li className="text-sm">"How can I reduce equipment theft on job sites?"</li>
                          <li className="text-sm">"What's the best way to track my HVAC service tools?"</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Expertise Settings</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          You can enable or disable specific trade expertise in the assistant by clicking the buttons in the header:
                        </p>
                        <ul className="space-y-2 list-disc pl-5">
                          <li className="text-sm"><strong>Construction</strong> - Heavy equipment, materials, job site management</li>
                          <li className="text-sm"><strong>HVAC</strong> - Service components, refrigerant tracking, seasonal inventory</li>
                          <li className="text-sm"><strong>Electrical</strong> - NEC compliance, components, testing equipment</li>
                          <li className="text-sm"><strong>Plumbing</strong> - UPC compliance, fixtures, specialty tools</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Feature Limitations</h3>
                        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            This is a demonstration version of TradeAssist AI with predefined responses. 
                            In a production environment, this would connect to an LLM with access to 
                            your inventory database for real-time, specific recommendations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="shadow-md h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{currentTier ? `${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} AI` : 'AI'} Assistant</CardTitle>
              </div>
              <CardDescription>
                {currentTier === 'premium' 
                  ? 'Unlock the full potential of your data with our most advanced AI'
                  : 'Asset intelligence powered by Perplexity AI'}
              </CardDescription>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="pt-4">
              <TieredAIAssistant />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
