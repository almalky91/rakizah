'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface AddTeacherDialogProps {
  onAddTeacher: (email: string, name: string, password: string) => Promise<void>;
}

export const AddTeacherDialog = ({ onAddTeacher }: AddTeacherDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAddTeacher(email, name, password);
      setEmail('');
      setName('');
      setPassword('');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="sm">
          <Plus className="w-4 h-4 ml-1" />
          إضافة معلم
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة معلم جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>الاسم الكامل</Label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder="اسم المعلم" 
            />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="email@example.com" 
              dir="ltr" 
            />
          </div>
          <div className="space-y-2">
            <Label>كلمة المرور</Label>
            <Input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="كلمة المرور" 
              dir="ltr" 
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? 'جاري الإضافة...' : 'إضافة المعلم'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
