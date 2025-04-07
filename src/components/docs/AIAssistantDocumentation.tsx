
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Bot, Construction, Wrench, Zap, Droplets, CircleDollarSign, FileQuestion, Briefcase, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AIAssistantDocumentation: React.FC = () => {
  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">TradeAssist AI</h2>
      </div>
      
      <p className="text-muted-foreground">
        TradeAssist AI is an intelligent assistant designed specifically for construction, HVAC, 
        electrical and plumbing professionals to optimize inventory management and asset tracking.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Capabilities Overview</CardTitle>
          <CardDescription>
            Domain-specific assistance for trade professionals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Construction className="h-5 w-5 text-amber-600" />
                <h3 className="font-medium">Construction Expertise</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Heavy equipment maintenance scheduling</li>
                <li>Construction material inventory optimization</li>
                <li>Jobsite equipment allocation recommendations</li>
                <li>Equipment utilization analysis</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">HVAC Systems</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>HVAC component inventory tracking</li>
                <li>Service part recommendation based on model</li>
                <li>Maintenance schedule optimization</li>
                <li>Refrigerant tracking and compliance</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <h3 className="font-medium">Electrical</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>NEC code compliance assistance</li>
                <li>Electrical component inventory management</li>
                <li>Testing equipment maintenance tracking</li>
                <li>Wire and conduit stock optimization</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-5 w-5 text-sky-500" />
                <h3 className="font-medium">Plumbing</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Plumbing fixture inventory tracking</li>
                <li>UPC code compliance assistance</li>
                <li>Material estimation for projects</li>
                <li>Specialty tool tracking and scheduling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Asset Tracking Intelligence</CardTitle>
          <CardDescription>
            AI-powered recommendations for optimal tracking solutions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            TradeAssist AI analyzes your equipment inventory and provides tailored recommendations 
            for the most effective tracking technology based on asset value, mobility needs, and 
            environmental conditions.
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="rfid-recommendations">
              <AccordionTrigger>RFID Recommendations</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    The AI analyzes your inventory to recommend where active vs. passive RFID 
                    would be most cost-effective.
                  </p>
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="font-medium mb-1">Sample Recommendation:</p>
                    <p className="italic text-muted-foreground">
                      "Based on your inventory profile, I recommend active RFID for your 15 core 
                      power tools that move between jobsites frequently. For your 200+ hand tools, 
                      passive RFID would be more cost-effective while still providing accurate 
                      inventory management."
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="gps-tracking">
              <AccordionTrigger>GPS Integration Analysis</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    TradeAssist AI identifies which assets would benefit most from GPS tracking, 
                    considering value, mobility, and theft risk.
                  </p>
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="font-medium mb-1">Sample Analysis:</p>
                    <p className="italic text-muted-foreground">
                      "Your 5 generators valued at $15,000+ each should be equipped with GPS 
                      trackers with geofence alerts. Based on industry data, these assets have a 
                      15% higher theft risk and GPS tracking provides an 80% recovery rate."
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="hybrid-solutions">
              <AccordionTrigger>Hybrid Tracking Solutions</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    The AI creates customized multi-tiered tracking strategies combining 
                    QR codes, RFID, and GPS based on your specific inventory profile.
                  </p>
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="font-medium mb-1">Sample Strategy:</p>
                    <div className="space-y-2">
                      <p className="italic text-muted-foreground">
                        "For optimal cost-efficiency with your inventory profile:
                      </p>
                      <ul className="list-disc ml-5 italic text-muted-foreground space-y-1">
                        <li>GPS: 8 heavy equipment assets (excavators, skid steers)</li>
                        <li>Active RFID: 42 power tools and testing equipment</li>
                        <li>Passive RFID: 156 maintenance-critical components</li>
                        <li>QR Codes: 300+ consumable inventory items</li>
                      </ul>
                      <p className="italic text-muted-foreground">
                        This approach balances tracking precision with implementation cost."
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory Optimization</CardTitle>
          <CardDescription>
            AI-driven inventory management for trade-specific needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1 border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CircleDollarSign className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-medium">Cost Reduction</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  TradeAssist analyzes usage patterns to identify overstocked items and 
                  optimization opportunities, reducing carrying costs by an average of 12-18%.
                </p>
              </div>
              
              <div className="flex-1 border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="font-medium">Stockout Prevention</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Predictive analytics monitor inventory levels and project requirements to alert when 
                  critical components need reordering, reducing stockouts by up to 87%.
                </p>
              </div>
              
              <div className="flex-1 border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  <h3 className="font-medium">Job Readiness</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  TradeAssist creates job-specific equipment and material lists based on project 
                  specifications, ensuring crews arrive fully prepared for each task.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Trade-Specific Inventory Intelligence</h3>
              <p className="text-sm text-muted-foreground mb-4">
                TradeAssist adapts its inventory recommendations based on your company's primary trade focus:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-md bg-muted/30 p-3">
                  <p className="font-medium text-sm mb-1">Electrical Contractors</p>
                  <p className="text-xs text-muted-foreground">
                    Optimizes wire inventory by calculating precise needs based on upcoming projects,
                    recommends appropriate circuit breaker inventory levels based on historical usage and 
                    local code requirements, and tracks test equipment calibration status.
                  </p>
                </div>
                
                <div className="rounded-md bg-muted/30 p-3">
                  <p className="font-medium text-sm mb-1">HVAC Companies</p>
                  <p className="text-xs text-muted-foreground">
                    Manages refrigerant inventory with EPA compliance tracking, optimizes seasonal 
                    component inventory (heating vs. cooling), and provides equipment compatibility 
                    cross-references for replacement parts.
                  </p>
                </div>
                
                <div className="rounded-md bg-muted/30 p-3">
                  <p className="font-medium text-sm mb-1">Plumbing Operations</p>
                  <p className="text-xs text-muted-foreground">
                    Balances inventory of different pipe materials and sizes based on job forecasts,
                    manages specialty tool checkout system, and tracks fixture inventory with 
                    model-specific installation kit bundling.
                  </p>
                </div>
                
                <div className="rounded-md bg-muted/30 p-3">
                  <p className="font-medium text-sm mb-1">General Construction</p>
                  <p className="text-xs text-muted-foreground">
                    Optimizes heavy equipment allocation across job sites, manages consumable 
                    inventory with automated reordering thresholds, and tracks specialized 
                    equipment maintenance schedules and certification requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Using TradeAssist AI</CardTitle>
          <CardDescription>
            How to interact with the assistant in your workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <h3 className="font-medium">Available Commands</h3>
              <div className="bg-muted rounded-md p-3">
                <div className="space-y-2">
                  <div>
                    <code className="text-sm font-mono bg-background px-1 rounded">/analyze-inventory</code>
                    <p className="text-xs text-muted-foreground">Scan current inventory for optimization opportunities</p>
                  </div>
                  <div>
                    <code className="text-sm font-mono bg-background px-1 rounded">/track-recommendation</code>
                    <p className="text-xs text-muted-foreground">Get tracking technology recommendations for selected items</p>
                  </div>
                  <div>
                    <code className="text-sm font-mono bg-background px-1 rounded">/compliance-check</code>
                    <p className="text-xs text-muted-foreground">Verify if equipment meets industry code requirements</p>
                  </div>
                  <div>
                    <code className="text-sm font-mono bg-background px-1 rounded">/project-prep [project ID]</code>
                    <p className="text-xs text-muted-foreground">Generate equipment and material list for specific project</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium mb-2">Integration Points</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <span className="font-medium">Inventory Management</span>
                  <p className="text-xs text-muted-foreground">TradeAssist analyzes inventory data to provide recommendations</p>
                </li>
                <li>
                  <span className="font-medium">Equipment Detail Pages</span>
                  <p className="text-xs text-muted-foreground">Access AI assistant directly from equipment detail views</p>
                </li>
                <li>
                  <span className="font-medium">Project Planning</span>
                  <p className="text-xs text-muted-foreground">AI helps allocate resources and equipment to projects</p>
                </li>
                <li>
                  <span className="font-medium">Compliance Reporting</span>
                  <p className="text-xs text-muted-foreground">Get assistance interpreting compliance requirements</p>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 flex justify-center">
            <Link to="/ai-assistant">
              <Button className="gap-2">
                <Bot size={16} />
                <span>Try TradeAssist AI Now</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistantDocumentation;
