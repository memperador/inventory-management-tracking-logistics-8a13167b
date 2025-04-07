
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProjectAsset } from '../types/projectTypes';
import AssetActions from './AssetActions';

interface ProjectAssetTableProps {
  assets: ProjectAsset[];
  isLoading: boolean;
  onRemoveAsset: (assetId: string) => void;
}

export const ProjectAssetTable: React.FC<ProjectAssetTableProps> = ({ 
  assets, 
  isLoading, 
  onRemoveAsset 
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead>Permanent/Temporary</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                Loading assets...
              </TableCell>
            </TableRow>
          ) : assets.length > 0 ? (
            assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.equipment.name}</TableCell>
                <TableCell>{asset.equipment.type}</TableCell>
                <TableCell>{asset.equipment.category || 'N/A'}</TableCell>
                <TableCell>
                  <Badge 
                    className={`
                      ${asset.equipment.status === 'Operational' ? 'bg-green-100 text-green-800' : 
                       asset.equipment.status === 'Maintenance' ? 'bg-amber-100 text-amber-800' : 
                       'bg-red-100 text-red-800'}
                    `}
                  >
                    {asset.equipment.status || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(asset.assigned_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={asset.is_temporary ? "outline" : "default"}>
                    {asset.is_temporary ? 'Temporary' : 'Permanent'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <AssetActions 
                    assetId={asset.id}
                    isRemoved={!!asset.removed_date}
                    onRemove={onRemoveAsset}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No assets assigned to this project yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectAssetTable;
