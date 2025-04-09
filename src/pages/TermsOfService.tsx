
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using Inventory Track Pro (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you do not have permission to access the Service.</p>
            
            <h2>2. Description of Service</h2>
            <p>Inventory Track Pro provides inventory management, equipment tracking, project management, and related services for businesses. The Service is provided "as is" and "as available" without warranties of any kind.</p>
            
            <h2>3. User Accounts</h2>
            <p>To use certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.</p>
            
            <h2>4. User Data</h2>
            <p>You retain all rights to the data you upload to the Service. By using the Service, you grant us a license to use, modify, and display your data solely as necessary to provide the Service to you.</p>
            
            <h2>5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any illegal purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use the Service to transmit viruses, malware, or other harmful code</li>
              <li>Collect user information without their consent</li>
            </ul>
            
            <h2>6. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are owned by the Service provider and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
            
            <h2>7. Termination</h2>
            <p>We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>
            
            <h2>8. Limitation of Liability</h2>
            <p>In no event shall Inventory Track Pro, its officers, directors, employees, or agents be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
            <ul>
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use or alteration of your transmissions or content</li>
            </ul>
            
            <h2>9. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless Inventory Track Pro, its parent, subsidiaries, affiliates, and their respective officers, directors, employees, and agents, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from:</p>
            <ul>
              <li>Your use of and access to the Service</li>
              <li>Your violation of any term of these Terms</li>
              <li>Your violation of any third-party right, including without limitation any copyright, property, or privacy right</li>
              <li>Any claim that your content caused damage to a third party</li>
            </ul>
            
            <h2>10. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
            
            <h2>11. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>
            
            <h2>12. Dispute Resolution</h2>
            <p>Any dispute arising from or relating to these Terms or the Service shall first be resolved through good-faith negotiation. If such negotiation fails, the dispute will be submitted to binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in [Your Jurisdiction], and the arbitration award shall be final and binding on the parties.</p>
            
            <h2>13. Severability</h2>
            <p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>
            
            <h2>14. Entire Agreement</h2>
            <p>These Terms constitute the entire agreement between you and Inventory Track Pro regarding the Service and supersede all prior and contemporaneous agreements, proposals, or representations, written or oral, concerning its subject matter.</p>
            
            <p className="text-sm text-gray-500 mt-8">Last Updated: April 9, 2025</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
