
import React from 'react';

const WhatsNextSection: React.FC = () => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="font-medium mb-2">What's Next?</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Add your organization details</li>
        <li>Invite team members</li>
        <li>Start managing your inventory items</li>
        <li>Create your first project</li>
      </ul>
    </div>
  );
};

export default WhatsNextSection;
