
import React from 'react';

interface PageDescriptionProps {
  description: string;
}

const PageDescription: React.FC<PageDescriptionProps> = ({ description }) => {
  return <p className="text-gray-500 mt-1">{description}</p>;
};

export default PageDescription;
