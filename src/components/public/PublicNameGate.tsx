import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, User, Sparkles } from 'lucide-react';

interface Props {
  teacherName: string;
  pageTitle?: string | null;
  studentName: string;
  setStudentName: (name: string) => void;
  onConfirm: () => void;
}

const PublicNameGate = ({ teacherName, pageTitle, studentName, setStudentName, onConfirm }: Props) => {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md glass relative z-10 shadow-2xl border-border/30">
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl mb-1">صفحة {teacherName}</CardTitle>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" />
            أدخل اسمك للبدء في التعلم
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); onConfirm(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentName"><User className="w-4 h-4 inline ml-1" />اسم الطالب</Label>
              <Input id="studentName" value={studentName} onChange={e => setStudentName(e.target.value)} required placeholder="أدخل اسمك الكامل" className="text-center text-lg h-12" />
            </div>
            <Button type="submit" variant="hero" className="w-full h-12 text-base">
              🚀 ابدأ التعلم
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicNameGate;
