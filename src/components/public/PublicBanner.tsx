import { GraduationCap, School, BookOpen, Users } from 'lucide-react';

const TEMPLATE_STYLES: Record<string, { gradient: string; accent: string }> = {
  classic: {
    gradient: 'linear-gradient(135deg, hsl(220 25% 10%), hsl(215 80% 25%), hsl(220 25% 14%))',
    accent: 'hsl(215 80% 55%)',
  },
  emerald: {
    gradient: 'linear-gradient(135deg, hsl(160 30% 8%), hsl(160 60% 25%), hsl(155 40% 12%))',
    accent: 'hsl(160 60% 45%)',
  },
  sunset: {
    gradient: 'linear-gradient(135deg, hsl(15 30% 10%), hsl(25 80% 35%), hsl(350 50% 25%))',
    accent: 'hsl(25 90% 55%)',
  },
  royal: {
    gradient: 'linear-gradient(135deg, hsl(270 30% 10%), hsl(270 60% 30%), hsl(280 40% 15%))',
    accent: 'hsl(270 60% 55%)',
  },
  ocean: {
    gradient: 'linear-gradient(135deg, hsl(195 30% 8%), hsl(190 70% 30%), hsl(200 50% 15%))',
    accent: 'hsl(190 70% 50%)',
  },
  rose: {
    gradient: 'linear-gradient(135deg, hsl(340 25% 10%), hsl(340 60% 30%), hsl(350 40% 15%))',
    accent: 'hsl(340 60% 55%)',
  },
};

interface PublicBannerProps {
  profile: {
    full_name: string | null;
    school_name: string | null;
    page_title: string | null;
    bio: string | null;
    page_template?: string;
  };
  studentName: string;
  totalContent: number;
}

const PublicBanner = ({ profile, studentName, totalContent }: PublicBannerProps) => {
  const template = TEMPLATE_STYLES[profile.page_template || 'classic'] || TEMPLATE_STYLES.classic;

  return (
    <div className="relative overflow-hidden">
      <div className="min-h-[280px] relative" style={{ background: template.gradient }}>
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl" style={{ background: template.accent, opacity: 0.1 }} />
          <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full blur-3xl" style={{ background: template.accent, opacity: 0.08 }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style={{ background: template.accent, opacity: 0.05 }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-10 pb-16">
          {/* Welcome badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-sm">
              <Users className="w-3.5 h-3.5" />
              مرحباً {studentName} 👋
            </span>
          </div>

          {/* Teacher avatar */}
          <div className="flex justify-center mb-4">
            <div
              className="w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white/20"
              style={{ background: template.accent }}
            >
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Teacher name */}
          <h1 className="text-3xl font-bold text-white text-center mb-1">
            {profile.page_title || profile.full_name || 'صفحة المعلم'}
          </h1>

          {/* School name */}
          {profile.school_name && (
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm mb-3">
              <School className="w-4 h-4" />
              <span>{profile.school_name}</span>
            </div>
          )}

          {profile.page_title && profile.full_name && (
            <p className="text-center text-white/70 text-sm mb-2">
              إعداد: {profile.full_name}
            </p>
          )}

          {profile.bio && (
            <p className="text-center text-white/60 text-sm max-w-lg mx-auto leading-relaxed mb-4">
              {profile.bio}
            </p>
          )}

          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <BookOpen className="w-4 h-4" />
              <span>{totalContent} محتوى تعليمي</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBanner;
