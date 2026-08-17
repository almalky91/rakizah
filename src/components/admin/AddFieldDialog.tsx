'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Subject } from './types';

interface AddFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddField: (e: React.FormEvent) => void;
  subjects: Subject[];
}

export const AddFieldDialog = ({
  open,
  onOpenChange,
  onAddField,
  subjects
}: AddFieldDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 ml-1" />
          إضافة مجال
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة مجال جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={onAddField} className="space-y-4">
          <div className="space-y-2">
            <Label>المادة</Label>
            <Select name="subject_id" required>
              <SelectTrigger>
                <SelectValue placeholder="اختر المادة" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>اسم المجال</Label>
            <Input 
              name="name" 
              required 
              placeholder="مثال: الأعداد والعمليات" 
            />
          </div>
          <div className="space-y-2">
            <Label>الوصف (اختياري)</Label>
            <Textarea 
              name="description" 
              placeholder="وصف المجال" 
              rows={2}
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
            إضافة المجال
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
