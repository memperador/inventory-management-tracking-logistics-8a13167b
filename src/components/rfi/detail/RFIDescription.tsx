
import React from 'react';

interface RFIDescriptionProps {
  description: string;
}

const RFIDescription: React.FC<RFIDescriptionProps> = ({ description }) => {
  return (
    <div>
      <p className="text-muted-foreground mb-2">Description</p>
      <p>{description}</p>
    </div>
  );
};

export default RFIDescription;
