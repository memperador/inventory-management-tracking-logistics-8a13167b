
import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MoveVertical } from 'lucide-react';
import { IndustryCode } from '@/types/tenant';

interface IndustryCodeListProps {
  codes: IndustryCode[];
  selectedCodeType: string;
  updateCode: (index: number, field: 'code' | 'description', value: string) => void;
  onDragEnd: (result: any) => void;
  addNewCode: () => void;
}

export function IndustryCodeList({
  codes,
  selectedCodeType,
  updateCode,
  onDragEnd,
  addNewCode
}: IndustryCodeListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{selectedCodeType} Codes</h3>
        <Button type="button" variant="outline" onClick={addNewCode}>
          Add Custom Code
        </Button>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="industry-codes">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {codes.map((code, index) => (
                <Draggable key={code.id} draggableId={code.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="mb-2"
                    >
                      <CardContent className="p-4 flex items-center">
                        <div
                          {...provided.dragHandleProps}
                          className="mr-3 cursor-grab"
                        >
                          <MoveVertical size={18} className="text-gray-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 flex-grow">
                          <Input 
                            placeholder="Code" 
                            value={code.code}
                            onChange={(e) => updateCode(index, 'code', e.target.value)}
                          />
                          <Input 
                            placeholder="Description" 
                            value={code.description}
                            onChange={(e) => updateCode(index, 'description', e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
