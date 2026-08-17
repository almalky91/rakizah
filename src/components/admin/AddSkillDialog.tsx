'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Grade, Subject, Field } from './types';

interface AddSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSkill: (e: React.FormEvent) => void;
  grades: Grade[];
  subjects: Subject[];
  fields: Field[];
}

export const AddSkillDialog = ({
  open,
  onOpenChange,
  onAddSkill,
  grades,
  subjects,
  fields
}: AddSkillDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="hero" size="sm">
          <Plus className="w-4 h-4 ml-1" />
          إضافة مهارة
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة مهارة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={onAddSkill} className="space-y-4">
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
            <Label>المجال</Label>
            <Select name="field_id" required>
              <SelectTrigger>
                <SelectValue placeholder="اختر المجال" />
              </SelectTrigger>
              <SelectContent>
                {fields.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <div className="space-y-2">
            <Label>رقم المهارة</Label>
            <Input type="number" name="skill_number" required placeholder="مثال: 1" />
          </div> */}
          <div className="space-y-2">
            <Label>عنوان المهارة</Label>
            <Textarea name="title" required placeholder="عنوان المهارة" rows={3} />
          </div>
          <div className="space-y-2">
            <Label>تفاصيل إضافية (اختياري)</Label>
            <Textarea name="description" placeholder="تفاصيل المهارة" rows={2} />
          </div>
          <div className="space-y-2">
            <Label>مستوى الصعوبة</Label>
            <Select name="difficulty_level" required defaultValue="basic">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">أساسي</SelectItem>
                <SelectItem value="intermediate">متوسط</SelectItem>
                <SelectItem value="advanced">متقدم</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" variant="hero" className="w-full">
            إضافة المهارة
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
