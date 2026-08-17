'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface AddGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGrade: (e: React.FormEvent) => void;
}

export const AddGradeDialog = ({
  open,
  onOpenChange,
  onAddGrade
}: AddGradeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 ml-1" />
          إضافة صف دراسي
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة صف دراسي جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={onAddGrade} className="space-y-4">
          <div className="space-y-2">
            <Label>اسم الصف</Label>
            <Input 
              name="name" 
              required 
              placeholder="مثال: الصف الثالث الابتدائي" 
            />
          </div>
          <div className="space-y-2">
            <Label>المستوى (رقم)</Label>
            <Input 
              type="number" 
              name="level" 
              required 
              placeholder="مثال: 3" 
              min="1"
              max="12"
            />
          </div>
          <div className="space-y-2">
            <Label>ترتيب العرض</Label>
            <Input 
              type="number" 
              name="display_order" 
              required 
              placeholder="مثال: 1" 
              min="1"
            />
          </div>
          <Button type="submit" variant="hero" className="w-full">
            إضافة الصف
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
