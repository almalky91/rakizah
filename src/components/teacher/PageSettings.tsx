import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Palette, Eye, Check, User, Link2, Lock, Mail } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'classic',
    name: 'كلاسيكي',
    description: 'تصميم أنيق بألوان أزرق داكن',
    gradient: 'linear-gradient(135deg, hsl(220 25% 10%), hsl(215 80% 25%), hsl(220 25% 14%))',
    accent: 'hsl(215 80% 55%)',
    cardBg: 'hsl(220 25% 14%)',
    textColor: 'hsl(0 0% 100%)',
  },
  {
    id: 'emerald',
    name: 'زمردي',
    description: 'أخضر هادئ يعكس الطبيعة',
    gradient: 'linear-gradient(135deg, hsl(160 30% 8%), hsl(160 60% 25%), hsl(155 40% 12%))',
    accent: 'hsl(160 60% 45%)',
    cardBg: 'hsl(160 30% 12%)',
    textColor: 'hsl(0 0% 100%)',
  },
  {
    id: 'sunset',
    name: 'غروب',
    description: 'ألوان دافئة بين البرتقالي والأحمر',
    gradient: 'linear-gradient(135deg, hsl(15 30% 10%), hsl(25 80% 35%), hsl(350 50% 25%))',
    accent: 'hsl(25 90% 55%)',
    cardBg: 'hsl(15 30% 14%)',
    textColor: 'hsl(0 0% 100%)',
  },
  {
    id: 'royal',
    name: 'ملكي',
    description: 'بنفسجي فاخر وأنيق',
    gradient: 'linear-gradient(135deg, hsl(270 30% 10%), hsl(270 60% 30%), hsl(280 40% 15%))',
    accent: 'hsl(270 60% 55%)',
    cardBg: 'hsl(270 30% 14%)',
    textColor: 'hsl(0 0% 100%)',
  },
  {
    id: 'ocean',
    name: 'محيطي',
    description: 'أزرق فيروزي منعش',
    gradient: 'linear-gradient(135deg, hsl(195 30% 8%), hsl(190 70% 30%), hsl(200 50% 15%))',
    accent: 'hsl(190 70% 50%)',
    cardBg: 'hsl(195 30% 12%)',
    textColor: 'hsl(0 0% 100%)',
  },
  {
    id: 'rose',
    name: 'وردي',
    description: 'وردي ناعم وعصري',
    gradient: 'linear-gradient(135deg, hsl(340 25% 10%), hsl(340 60% 30%), hsl(350 40% 15%))',
    accent: 'hsl(340 60% 55%)',
    cardBg: 'hsl(340 25% 14%)',
    textColor: 'hsl(0 0% 100%)',
  },
];

type PageSettingsProps = {
  onPublicSlugChange?: (slug: string | null) => void;
};

const PageSettings = ({ onPublicSlugChange }: PageSettingsProps) => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [publicSlug, setPublicSlug] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');
  const siteUrl = 'https://rakizah.lovable.app';
  const currentPublicLink = publicSlug ? `${siteUrl}/p/${publicSlug}` : '';

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, public_slug, page_title, school_name, bio, page_template')
        .eq('id', user.id)
        .single();
      if (data) {
        setFullName(data.full_name || '');
        setEmail(data.email || '');
        setOriginalEmail(data.email || '');
        setPublicSlug(data.public_slug || '');
        setPageTitle(data.page_title || '');
        setSchoolName((data as any).school_name || '');
        setBio((data as any).bio || '');
        setSelectedTemplate((data as any).page_template || 'classic');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    // Validate slug
    const slugClean = publicSlug.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    if (slugClean && slugClean.length < 3) {
      toast.error('الرابط يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    setSaving(true);

    // Check slug uniqueness
    if (slugClean) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('public_slug', slugClean)
        .neq('id', user.id)
        .maybeSingle();
      if (existing) {
        toast.error('هذا الرابط مستخدم بالفعل، اختر رابطاً آخر');
        setSaving(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || null,
        email: email || null,
        public_slug: slugClean || null,
        page_title: pageTitle || null,
        school_name: schoolName || null,
        bio: bio || null,
        page_template: selectedTemplate,
      } as any)
      .eq('id', user.id)
      .select('public_slug')
      .single();
    
    if (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } else {
      const savedSlug = (data as any)?.public_slug || null;
      setPublicSlug(savedSlug || '');
      onPublicSlugChange?.(savedSlug);
      toast.success('تم حفظ الإعدادات بنجاح');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* معلومات المعلم */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            معلومات المعلم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">اسم المعلم</Label>
            <Input
              id="fullName"
              placeholder="مثال: أحمد محمد"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publicSlug">رابط الصفحة العامة</Label>
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-muted/30 px-3 py-2" dir="ltr">
                <p className="mb-1 text-xs text-muted-foreground">رابط الموقع</p>
                <p className="break-all text-sm font-mono">{siteUrl}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-mono text-sm shrink-0" dir="ltr">/p/</span>
                <Input
                  id="publicSlug"
                  placeholder="رابط مخصص"
                  value={publicSlug}
                  onChange={(e) => setPublicSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase())}
                  dir="ltr"
                  className="font-mono text-left"
                />
              </div>
              {currentPublicLink && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2" dir="ltr">
                  <p className="mb-1 text-xs text-muted-foreground">الرابط الكامل</p>
                  <p className="break-all text-sm font-mono text-primary">{currentPublicLink}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">يمكنك تخصيص الرابط باستخدام أحرف إنجليزية وأرقام فقط، وإذا تركته فارغًا سيتم توليده تلقائيًا</p>
          </div>
        </CardContent>
      </Card>

      {/* معلومات الصفحة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            معلومات الصفحة العامة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pageTitle">عنوان الصفحة</Label>
            <Input
              id="pageTitle"
              placeholder="مثال: منصة الأستاذ أحمد التعليمية"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolName">اسم المدرسة</Label>
            <Input
              id="schoolName"
              placeholder="مثال: مدرسة النور الأهلية"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">نبذة تعريفية</Label>
            <Textarea
              id="bio"
              placeholder="اكتب نبذة قصيرة عن صفحتك التعليمية..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* قوالب المظهر */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            قالب مظهر الصفحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-200 text-right ${
                  selectedTemplate === t.id
                    ? 'border-primary ring-2 ring-primary/30 scale-[1.02]'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                {/* Preview */}
                <div
                  className="h-28 p-4 flex flex-col justify-end"
                  style={{ background: t.gradient }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: t.accent, color: t.textColor }}
                    >
                      م
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: t.textColor }}>
                        {t.name}
                      </div>
                      <div className="text-[10px] opacity-60" style={{ color: t.textColor }}>
                        عنوان تجريبي
                      </div>
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div className="p-3 bg-card">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                {/* Selected check */}
                {selectedTemplate === t.id && (
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto gap-2">
        <Save className="w-4 h-4" />
        {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
      </Button>
    </div>
  );
};

export { TEMPLATES };
export default PageSettings;
