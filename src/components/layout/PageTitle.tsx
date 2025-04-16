
import React from 'react';

interface PageTitleProps {
  title: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  return <h1 className="text-3xl font-bold tracking-tight">{title}</h1>;
};

export default PageTitle;
