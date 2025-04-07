import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Clock, 
  User, 
  Calendar,
  Tag,
  MessageCircle,
  FileText,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RFI } from '@/components/rfi/types';
import PageHeader from '@/components/common/PageHeader';

// Mock data - in a real application this would come from an API or database
const MOCK_RFI: RFI = {
  id: '1',
  title: 'Clarification on foundation reinforcement',
  description: 'Need clarification on the rebar spacing for the main building foundation. The plans show 12" O.C. but the structural notes mention 8" O.C. in high-stress areas. Please confirm which spacing should be used for the southwest corner of the building.',
  projectId: '85e6bf2f-a7e0-4943-941a-07a254f1a4ed',
  createdBy: 'John Doe',
  assignedTo: 'Jane Smith',
  status: 'submitted',
  dueDate: '2025-04-20',
  createdAt: '2025-04-07T14:30:00Z',
  updatedAt: '2025-04-07T14:30:00Z',
  responseText: null,
  responseDate: null,
  category: 'Structural',
  type: 'rfi'
};

const RFIDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rfi] = useState<RFI>(MOCK_RFI); // In a real app, fetch by ID
  const [responseText, setResponseText] = useState('');

  const handleSubmitResponse = () => {
    // In a real app, you would update the RFI via an API call
    toast({
      title: "Response submitted",
      description: "The RFI response has been submitted successfully.",
    });
  };

  const handleBackClick = () => {
    navigate('/rfi');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };
  
  const getRFIStatusColor = (status: string): string => {
    switch (status) {
      case 'draft':
        return 'bg-slate-500';
      case 'submitted':
        return 'bg-blue-500';
      case 'answered':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={rfi.title}
        description={`RFI #${rfi.id}`}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleBackClick}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to RFIs
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>Request Details</CardTitle>
                <Badge className={getRFIStatusColor(rfi.status)}>
                  {rfi.status.charAt(0).toUpperCase() + rfi.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground mb-2">Description</p>
                  <p>{rfi.description}</p>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-4">Response</h3>
                  {rfi.responseText ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Responded on {formatDate(rfi.responseDate)}</p>
                      <p>{rfi.responseText}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">No response yet. Provide a response below:</p>
                      <Textarea 
                        placeholder="Enter your response..." 
                        className="min-h-[150px]"
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                      />
                      <Button onClick={handleSubmitResponse}>Submit Response</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="attachments">
            <TabsList>
              <TabsTrigger value="attachments">
                <FileText className="h-4 w-4 mr-2" />
                Attachments
              </TabsTrigger>
              <TabsTrigger value="comments">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comments
              </TabsTrigger>
            </TabsList>
            <TabsContent value="attachments" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-8">
                    <div className="text-center space-y-2">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Drag and drop files here or click to upload</p>
                      <p className="text-xs text-muted-foreground">PDF, DWG, JPG, PNG up to 10MB</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Upload Files
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="comments" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">No comments yet</p>
                    <div className="space-y-2">
                      <Textarea placeholder="Add a comment..." />
                      <Button>Post Comment</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="flex items-start">
                  <dt className="w-8 mr-2 pt-0.5">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </dt>
                  <div>
                    <dd className="text-sm font-medium">Due Date</dd>
                    <dt className="text-sm text-muted-foreground">{formatDate(rfi.dueDate)}</dt>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <dt className="w-8 mr-2 pt-0.5">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </dt>
                  <div>
                    <dd className="text-sm font-medium">Created On</dd>
                    <dt className="text-sm text-muted-foreground">{formatDate(rfi.createdAt)}</dt>
                  </div>
                </div>

                <div className="flex items-start">
                  <dt className="w-8 mr-2 pt-0.5">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                  </dt>
                  <div>
                    <dd className="text-sm font-medium">Category</dd>
                    <dt className="text-sm text-muted-foreground">{rfi.category}</dt>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <dt className="w-8 mr-2 pt-0.5">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </dt>
                  <div>
                    <dd className="text-sm font-medium">Created By</dd>
                    <dt className="text-sm text-muted-foreground">{rfi.createdBy}</dt>
                  </div>
                </div>
                
                {rfi.assignedTo && (
                  <div className="flex items-start">
                    <dt className="w-8 mr-2 pt-0.5">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </dt>
                    <div>
                      <dd className="text-sm font-medium">Assigned To</dd>
                      <dt className="text-sm text-muted-foreground">{rfi.assignedTo}</dt>
                    </div>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" className="justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
                <Button variant="outline" className="justify-start">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Add Comment
                </Button>
                <Button variant="outline" className="justify-start text-red-500 hover:text-red-500">
                  Close RFI
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RFIDetail;
