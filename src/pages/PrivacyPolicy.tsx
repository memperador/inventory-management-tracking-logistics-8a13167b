
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
            <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>At Inventory Track Pro, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.</p>
            
            <h2>2. Information We Collect</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you:</p>
            <h3>2.1 Personal Data</h3>
            <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include:</p>
            <ul>
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Company name</li>
              <li>Phone number</li>
              <li>Address, State, Province, ZIP/Postal code, City</li>
              <li>Cookies and Usage Data</li>
            </ul>
            
            <h3>2.2 Usage Data</h3>
            <p>We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g., IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
            
            <h2>3. Use of Data</h2>
            <p>Inventory Track Pro uses the collected data for various purposes:</p>
            <ul>
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
            
            <h2>4. Data Retention</h2>
            <p>We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.</p>
            
            <h2>5. Data Transfer</h2>
            <p>Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.</p>
            
            <h2>6. Data Security</h2>
            <p>The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
            
            <h2>7. Your Data Protection Rights</h2>
            <p>Depending on your location, you may have the following data protection rights:</p>
            <ul>
              <li>The right to access, update or delete the information we have on you.</li>
              <li>The right of rectification - the right to have your information corrected if that information is inaccurate or incomplete.</li>
              <li>The right to object to our processing of your Personal Data.</li>
              <li>The right of restriction - the right to request that we restrict the processing of your personal information.</li>
              <li>The right to data portability - the right to be provided with a copy of your Personal Data in a structured, machine-readable and commonly used format.</li>
              <li>The right to withdraw consent - the right to withdraw your consent at any time where we relied on your consent to process your personal information.</li>
            </ul>
            
            <h2>8. Service Providers</h2>
            <p>We may employ third party companies and individuals to facilitate our Service ("Service Providers"), provide the Service on our behalf, perform Service-related services or assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
            
            <h2>9. Analytics</h2>
            <p>We may use third-party Service Providers to monitor and analyze the use of our Service.</p>
            
            <h2>10. Cookies</h2>
            <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.</p>
            
            <h2>11. Links to Other Sites</h2>
            <p>Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.</p>
            
            <h2>12. Children's Privacy</h2>
            <p>Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Child has provided us with Personal Data, please contact us.</p>
            
            <h2>13. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
            
            <h2>14. Limitation of Liability</h2>
            <p>By using Inventory Track Pro, you agree that any claim related to privacy or data protection shall be limited to the maximum extent permitted by applicable law. In no event shall Inventory Track Pro be liable for any consequential, incidental, indirect, special, punitive, or other damages whatsoever resulting from any data breach or privacy violation.</p>
            
            <h2>15. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <p>By email: [Your Contact Email]</p>
            
            <p className="text-sm text-gray-500 mt-8">Last Updated: April 9, 2025</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
