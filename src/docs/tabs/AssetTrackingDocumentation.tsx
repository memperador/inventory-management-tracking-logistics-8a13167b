
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const AssetTrackingDocumentation: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Tracking Technologies</CardTitle>
        <CardDescription>
          Comparison of RFID and QR Code/GPS tracking solutions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">RFID Technology</h3>
          <p className="mb-3">
            Radio-frequency identification (RFID) uses electromagnetic fields to automatically identify and track 
            tags attached to objects.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-lg text-amber-600">Active RFID</h4>
              <p className="text-sm mb-2">Battery-powered tags with broadcasting capability (range up to 100m)</p>
              <div className="mt-2">
                <h5 className="font-medium">Advantages:</h5>
                <ul className="list-disc ml-5 text-sm">
                  <li>Long read range (up to 100 meters)</li>
                  <li>Real-time location tracking</li>
                  <li>No line-of-sight required</li>
                  <li>Supports sensor integration (temperature, humidity)</li>
                </ul>
              </div>
              <div className="mt-2">
                <h5 className="font-medium">Disadvantages:</h5>
                <ul className="list-disc ml-5 text-sm">
                  <li>Higher cost ($15-50 per tag)</li>
                  <li>Requires battery replacement</li>
                  <li>Larger tag size</li>
                </ul>
              </div>
              <div className="mt-2">
                <h5 className="font-medium">Best Used For:</h5>
                <ul className="list-disc ml-5 text-sm">
                  <li>High-value equipment tracking</li>
                  <li>Items that move frequently between locations</li>
                  <li>When real-time location data is critical</li>
                </ul>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-lg text-amber-600">Passive RFID</h4>
              <p className="text-sm mb-2">No battery needed, powered by reader's signal (range up to 10m)</p>
              <div className="mt-2">
                <h5 className="font-medium">Advantages:</h5>
                <ul className="list-disc ml-5 text-sm">
                  <li>Lower cost ($0.10-$5 per tag)</li>
                  <li>No battery required (unlimited lifespan)</li>
                  <li>Smaller tag size, various form factors</li>
                  <li>Bulk scanning capability</li>
                </ul>
              </div>
              <div className="mt-2">
                <h5 className="font-medium">Disadvantages:</h5>
                <ul className="list-disc ml-5 text-sm">
                  <li>Shorter read range (few centimeters to 10 meters)</li>
                  <li>Not suitable for real-time tracking</li>
                  <li>Signal interference with metals and liquids</li>
                </ul>
              </div>
              <div className="mt-2">
                <h5 className="font-medium">Best Used For:</h5>
                <ul className="list-disc ml-5 text-sm">
                  <li>Inventory counts and audits</li>
                  <li>Access control systems</li>
                  <li>Tool tracking in controlled environments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold">QR Codes & GPS Tracking</h3>
          <p className="mb-3">
            Alternative tracking methods that can be used alone or in combination with RFID.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-lg text-amber-600">QR Codes</h4>
              <p className="text-sm mb-2">Machine-readable optical labels that contain information about the item</p>
              <div className="mt-2">
                <h5 className="font-medium">Advantages:</h5>
                <ul className="list-disc ml-5 text-sm">
                  <li>Extremely low cost (cents to print)</li>
                  <li>Easily generated and replaced</li>
                  <li>Scannable with standard smartphones</li>
                  <li>Can store substantial information</li>
                </ul>
              </div>
              <div className="mt-2">
                <h5 className="font-medium">Disadvantages:</h5>
                <ul className="list-disc ml-5 text-sm">
                  <li>Requires line-of-sight for scanning</li>
                  <li>Vulnerable to physical damage</li>
                  <li>Manual scanning process (one at a time)</li>
                  <li>No automated tracking capability</li>
                </ul>
              </div>
              <div className="mt-2">
                <h5 className="font-medium">Best Used For:</h5>
                <ul className="list-disc ml-5 text-sm">
                  <li>Low-cost tracking solution</li>
                  <li>When smartphone scanning is preferred</li>
                  <li>Items in clean, controlled environments</li>
                  <li>When detailed information needs to be embedded</li>
                </ul>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-lg text-amber-600">GPS Tracking</h4>
              <p className="text-sm mb-2">Global Positioning System for worldwide location tracking</p>
              <div className="mt-2">
                <h5 className="font-medium">Advantages:</h5>
                <ul className="list-disc ml-5 text-sm">
                  <li>Precise location data (within meters)</li>
                  <li>Global coverage outdoors</li>
                  <li>Real-time tracking capabilities</li>
                  <li>Movement alerts and geofencing</li>
                </ul>
              </div>
              <div className="mt-2">
                <h5 className="font-medium">Disadvantages:</h5>
                <ul className="list-disc ml-5 text-sm">
                  <li>Higher cost ($50-500 per tracker)</li>
                  <li>Requires power source (battery)</li>
                  <li>Limited functionality indoors</li>
                  <li>Ongoing cellular data costs</li>
                </ul>
              </div>
              <div className="mt-2">
                <h5 className="font-medium">Best Used For:</h5>
                <ul className="list-disc ml-5 text-sm">
                  <li>Vehicles and heavy equipment</li>
                  <li>High-value assets used outdoors</li>
                  <li>Theft prevention and recovery</li>
                  <li>Equipment deployed in remote locations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold">Hybrid Tracking Strategy</h3>
          <p className="mb-3">
            Many organizations achieve optimal results by implementing a tiered tracking approach.
          </p>
          
          <div className="border rounded-lg p-4 mb-4">
            <h4 className="font-medium">Recommended Implementation</h4>
            <p className="mb-2 text-sm">
              For construction equipment management, we recommend a multi-tiered approach:
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-2">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                <h5 className="font-medium text-amber-700 dark:text-amber-400">Tier 1: GPS Tracking</h5>
                <p className="text-xs mb-1">For high-value assets ($25,000+)</p>
                <ul className="list-disc ml-4 text-xs">
                  <li>Heavy machinery</li>
                  <li>Vehicles</li>
                  <li>Generators</li>
                  <li>Mobile offices</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                <h5 className="font-medium text-amber-700 dark:text-amber-400">Tier 2: Active RFID</h5>
                <p className="text-xs mb-1">For mid-value assets ($1,000-$25,000)</p>
                <ul className="list-disc ml-4 text-xs">
                  <li>Power tools</li>
                  <li>Specialized equipment</li>
                  <li>IT equipment</li>
                  <li>Testing devices</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                <h5 className="font-medium text-amber-700 dark:text-amber-400">Tier 3: Passive RFID/QR</h5>
                <p className="text-xs mb-1">For lower-value assets (Under $1,000)</p>
                <ul className="list-disc ml-4 text-xs">
                  <li>Hand tools</li>
                  <li>Safety equipment</li>
                  <li>Consumable inventory</li>
                  <li>Office equipment</li>
                </ul>
              </div>
            </div>
            
            <p className="text-sm mt-3">
              This system optimizes tracking investments by matching technology cost with asset value and 
              criticality, while providing a comprehensive inventory management solution.
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium">System Integration</h4>
            <p className="text-sm mb-2">
              The FleetTrack platform supports all tracking technologies through:
            </p>
            <ul className="list-disc ml-5 text-sm">
              <li>API integrations with major GPS providers</li>
              <li>RFID reader compatibility and data import</li>
              <li>Mobile app for QR code scanning (coming soon)</li>
              <li>Unified dashboard showing all asset locations regardless of tracking method</li>
              <li>Automated alerts for movement, maintenance, and compliance across all tracking technologies</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetTrackingDocumentation;
