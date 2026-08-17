'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Gamepad2, Video, Trophy, Users, ArrowLeft, Quote, GraduationCap, ClipboardList, MessageCircle, Star } from 'lucide-react';
import logoImg from '@/assets/logo.jpg';
import Image from 'next/image';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, target, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, target, duration]);

  return <span ref={ref}>{display.toLocaleString('en-US')}</span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  },
};

const LandingPage = () => {
  // TODO: Create a stats API endpoint to fetch real-time statistics
  // For now, using static placeholder values
  const [stats, setStats] = useState({ teachers: 120, quizzes: 350, students: 480 });

  useEffect(() => {
    // When stats API is implemented, fetch from /api/stats
    // Example:
    // const fetchStats = async () => {
    //   try {
    //     const response = await fetch('/api/stats');
    //     const data = await response.json();
    //     setStats(data);
    //   } catch (error) {
    //     console.error('Failed to fetch stats:', error);
    //   }
    // };
    // fetchStats();
  }, []);

  const features = [
    { icon: Video, title: 'مركز الفيديو', desc: 'مقاطع فيديو تعليمية من يوتيوب منظمة بعناية' },
    { icon: BookOpen, title: 'مركز الاختبارات', desc: 'اختبارات تفاعلية متعددة الخيارات' },
    { icon: Gamepad2, title: 'التعلم باللعب', desc: 'العجلة الدوارة ولعبة الذاكرة لتعزيز التعلم' },
    { icon: Trophy, title: 'لوحة الأداء', desc: 'تتبع التقدم والإنجازات والنقاط' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="gradient-hero min-h-screen flex flex-col overflow-hidden">
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full"
        >
          <div className="flex items-center gap-2 shrink-0">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Image
                src={logoImg}
                alt="شعار المنصة"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover"
                placeholder="blur"
              />
            </motion.div>
            <span className="text-base sm:text-xl font-bold text-primary-foreground">منصتي التعليمية</span>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-primary/30 text-primary-foreground bg-primary/10 hover:bg-primary/20 text-xs sm:text-sm px-2 sm:px-4">
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="hero" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">إنشاء حساب</Button>
            </Link>
          </div>
        </motion.nav>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
          <div className="text-center max-w-3xl w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/20 text-primary-foreground/80 text-xs sm:text-sm mb-4 sm:mb-6"
            >
              <Image
                src={logoImg}
                alt="شعار"
                className="w-4 h-4 rounded-full object-cover"
                placeholder="blur"
              />
              منصة تعليمية متكاملة
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black text-primary-foreground leading-tight mb-4 sm:mb-6"
            >
              تعلّم، العب، <span className="text-gradient">وتميّز</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-sm sm:text-lg md:text-2xl text-primary-foreground/70 mb-6 sm:mb-10 max-w-2xl mx-auto px-2 leading-relaxed"
            >
              منصة تعليمية تجمع بين الفيديوهات والاختبارات والألعاب التفاعلية لتجربة تعليمية ممتعة وفعّالة
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex gap-4 justify-center"
            >
              <Link href="/register">
                <Button variant="gold" size="sm" className="text-sm sm:text-lg sm:px-8 sm:py-6 px-5">
                  ابدأ الآن مجاناً
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex justify-center pb-8 sm:pb-12 px-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-primary-foreground/50 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>طلاب غير محدودين</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-primary-foreground/30 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>ألعاب تعليمية</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-primary-foreground/30 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>فيديوهات يوتيوب</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center mb-8 sm:mb-16"
          >
           <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">كل ما تحتاجه في مكان واحد</h2>
            <p className="text-muted-foreground text-sm sm:text-lg">أدوات تعليمية متكاملة لتجربة تعليمية استثنائية</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group p-4 sm:p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-colors duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl gradient-primary flex items-center justify-center mb-2 sm:mb-4"
                >
                  <f.icon className="w-4 h-4 sm:w-7 sm:h-7 text-primary-foreground" />
                </motion.div>
               <h3 className="text-sm sm:text-lg font-bold mb-0.5 sm:mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-3 sm:gap-8">
            {[
              { icon: GraduationCap, label: 'معلم', value: stats.teachers, color: 'text-primary' },
              { icon: ClipboardList, label: 'اختبار', value: stats.quizzes, color: 'text-accent' },
              { icon: Users, label: 'طالب', value: stats.students, color: 'text-primary' },
            ].map((s, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                className="text-center p-4 sm:p-8 rounded-2xl bg-card border border-border"
              >
                <s.icon className={`w-6 h-6 sm:w-10 sm:h-10 mx-auto mb-1.5 sm:mb-3 ${s.color}`} />
                <div className="text-2xl sm:text-4xl font-bold mb-0.5">
                  <AnimatedCounter target={s.value} />
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center mb-8 sm:mb-14"
          >
           <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">ماذا يقول مستخدمونا</h2>
            <p className="text-muted-foreground text-sm sm:text-lg">آراء المعلمين والمعلمات الذين يستخدمون المنصة</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { name: 'محمد آل فروان', text: 'منصة رائعة سهّلت عليّ تنظيم المحتوى التعليمي وتفاعل الطلاب بشكل ملحوظ', role: 'معلم' },
              { name: 'منى الشهراني', text: 'الألعاب التعليمية أضافت متعة حقيقية للتعلم وزادت من دافعية طالباتي', role: 'معلمة' },
              { name: 'زياد الحربي', text: 'لوحة الأداء ساعدتني في متابعة تقدم الطلاب بسهولة واتخاذ قرارات تعليمية أفضل', role: 'معلم' },
              { name: 'منيرة عبدالله', text: 'أفضل منصة تعليمية استخدمتها، الاختبارات التفاعلية وفّرت عليّ وقتاً كبيراً', role: 'معلمة' },
              { name: 'ابتهال القرني', text: 'تجربة مميزة جداً، الطالبات يحبون الصفحة العامة والمشاركة في الأنشطة', role: 'معلمة' },
            ].map((t, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                className="relative p-5 sm:p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors duration-300"
              >
                <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-primary/15 absolute top-4 left-4 rotate-180" />
                <p className="text-foreground/80 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 pt-4">{t.text}</p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs sm:text-base">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-xs sm:text-base">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={scaleIn}
          className="max-w-4xl mx-auto gradient-primary rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center"
        >
         <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-2 sm:mb-4">مستعد للبدء؟</h2>
          <p className="text-primary-foreground/80 text-sm sm:text-lg mb-5 sm:mb-8">انضم إلى المنصة وابدأ رحلتك التعليمية اليوم</p>
          <Link href="/register">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button variant="gold" size="sm" className="text-sm sm:text-lg sm:px-8 sm:py-3">
                سجّل الآن
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-t border-border py-8 px-6 text-center text-muted-foreground"
      >
        <p>© 2026 منصتي التعليمية - جميع الحقوق محفوظة</p>
      </motion.footer>

      {/* WhatsApp FAB */}
      <motion.a
        href="https://wa.me/966503329625"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[hsl(142,70%,45%)] text-white flex items-center justify-center shadow-lg hover:shadow-xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
        >
          <MessageCircle className="w-7 h-7" fill="white" />
        </motion.div>
      </motion.a>
    </div>
  );
};

export default LandingPage;
