import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Gamepad2, Video, Trophy, Users, Star, ArrowLeft } from 'lucide-react';

const LandingPage = () => {
  const features = [
    { icon: Video, title: 'مركز الفيديو', desc: 'مقاطع فيديو تعليمية من يوتيوب منظمة بعناية' },
    { icon: BookOpen, title: 'مركز الاختبارات', desc: 'اختبارات تفاعلية متعددة الخيارات' },
    { icon: Gamepad2, title: 'التعلم باللعب', desc: 'العجلة الدوارة ولعبة الذاكرة لتعزيز التعلم' },
    { icon: Trophy, title: 'لوحة الأداء', desc: 'تتبع التقدم والإنجازات والنقاط' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero min-h-screen flex flex-col">
        <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Star className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary-foreground">منصتي التعليمية</span>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="outline" className="border-primary/30 text-primary-foreground bg-primary/10 hover:bg-primary/20">
                تسجيل الدخول
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="hero">إنشاء حساب</Button>
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground/80 text-sm mb-6">
              <Star className="w-4 h-4 text-accent" />
              منصة تعليمية متكاملة
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-primary-foreground leading-tight mb-6">
              تعلّم، العب، <span className="text-gradient">وتميّز</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
              منصة تعليمية تجمع بين الفيديوهات والاختبارات والألعاب التفاعلية لتجربة تعليمية ممتعة وفعّالة
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/register">
                <Button variant="gold" size="lg" className="text-lg px-8">
                  ابدأ الآن مجاناً
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center pb-12">
          <div className="flex items-center gap-6 text-primary-foreground/50 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>طلاب غير محدودين</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-primary-foreground/30" />
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>ألعاب تعليمية</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-primary-foreground/30" />
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>فيديوهات يوتيوب</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">كل ما تحتاجه في مكان واحد</h2>
            <p className="text-muted-foreground text-lg">أدوات تعليمية متكاملة لتجربة تعليمية استثنائية</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto gradient-primary rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">مستعد للبدء؟</h2>
          <p className="text-primary-foreground/80 mb-8">انضم إلى المنصة وابدأ رحلتك التعليمية اليوم</p>
          <Link to="/register">
            <Button variant="gold" size="lg" className="text-lg px-8">
              سجّل الآن
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-muted-foreground">
        <p>© 2026 منصتي التعليمية - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};

export default LandingPage;
