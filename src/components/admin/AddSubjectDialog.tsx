'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Grade } from './types';

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSubject: (e: React.FormEvent) => void;
  grades: Grade[];
}

export const AddSubjectDialog = ({
  open,
  onOpenChange,
  onAddSubject,
  grades
}: AddSubjectDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 ml-1" />
          إضافة مادة
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة مادة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={onAddSubject} className="space-y-4">
          <div className="space-y-2">
            <Label>الصف الدراسي</Label>
            <Select name="grade_id" required>
              <SelectTrigger>
                <SelectValue placeholder="اختر الصف" />
              </SelectTrigger>
              <SelectContent>
                {grades.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>اسم المادة</Label>
            <Input 
              name="name" 
              required 
              placeholder="مثال: الرياضيات" 
            />
          </div>
          <div className="space-y-2">
            <Label>الأيقونة</Label>
            <Input 
              name="icon" 
              required 
              placeholder="مثال: BookOpen" 
              defaultValue="BookOpen"
            />
            <p className="text-xs text-muted-foreground">
              أيقونات متاحة: BookOpen, Beaker, Globe, etc.
            </p>
          </div>
          <div className="space-y-2">
            <Label>اللون (Hex)</Label>
            <Input 
              name="color" 
              required 
              placeholder="مثال: #10b981" 
              pattern="^#[0-9A-Fa-f]{6}$"
            />
            <p className="text-xs text-muted-foreground">
              مثال: #10b981 (أخضر), #3b82f6 (أزرق)
            </p>
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
            إضافة المادة
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
