
import React, { ReactNode } from 'react';
import PageTitle from './PageTitle';
import PageDescription from './PageDescription';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <PageTitle title={title} />
        {description && <PageDescription description={description} />}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
};

export default PageHeader;
