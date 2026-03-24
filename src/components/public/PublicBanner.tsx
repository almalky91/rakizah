import { GraduationCap, School, BookOpen, Users } from 'lucide-react';

interface PublicBannerProps {
  profile: {
    full_name: string | null;
    school_name: string | null;
    page_title: string | null;
    bio: string | null;
  };
  studentName: string;
  totalContent: number;
}

const PublicBanner = ({ profile, studentName, totalContent }: PublicBannerProps) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="gradient-hero min-h-[280px] relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-10 pb-16">
          {/* Welcome badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 text-primary-foreground/80 text-sm">
              <Users className="w-3.5 h-3.5" />
              مرحباً {studentName} 👋
            </span>
          </div>

          {/* Teacher avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl gradient-primary shadow-lg flex items-center justify-center border-4 border-primary-foreground/20">
              <GraduationCap className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          {/* Teacher name */}
          <h1 className="text-3xl font-bold text-primary-foreground text-center mb-1">
            {profile.page_title || profile.full_name || 'صفحة المعلم'}
          </h1>

          {/* School name */}
          {profile.school_name && (
            <div className="flex items-center justify-center gap-2 text-primary-foreground/60 text-sm mb-3">
              <School className="w-4 h-4" />
              <span>{profile.school_name}</span>
            </div>
          )}

          {/* Teacher name if page_title is set */}
          {profile.page_title && profile.full_name && (
            <p className="text-center text-primary-foreground/70 text-sm mb-2">
              إعداد: {profile.full_name}
            </p>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-center text-primary-foreground/60 text-sm max-w-lg mx-auto leading-relaxed mb-4">
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-primary-foreground/50 text-xs">
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
