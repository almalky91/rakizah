/**
 * Arabic Font Test Page
 * 
 * Manual testing page for Task 12.3: Configure Arabic font rendering
 * 
 * This page allows visual verification of:
 * - Arabic font loading and display
 * - Diacritics rendering
 * - Ligatures display
 * - Text readability at different sizes
 * - Font smoothing and antialiasing
 * 
 * To use: Navigate to /arabic-font-test in the browser
 */

import React, { useState } from 'react';
import { ArabicFontTest } from '@/components/public/skill-chatbot/ArabicFontTest';
import { SkillChatbotDialog } from '@/components/public/skill-chatbot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export const ArabicFontTestPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            اختبار عرض الخطوط العربية
          </h1>
          <h2 className="text-2xl text-muted-foreground">
            Arabic Font Rendering Test - Task 12.3
          </h2>
          <p className="text-lg">
            هذه الصفحة لاختبار عرض الخطوط العربية في المساعد الذكي
          </p>
        </div>

        {/* Live Chatbot Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <MessageSquare className="w-6 h-6" />
              اختبار المساعد الذكي المباشر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              افتح المساعد الذكي لاختبار عرض النصوص العربية الكاملة مع التشكيل والحروف المتصلة
            </p>
            
            <div className="flex gap-4 flex-wrap">
              <Button
                onClick={() => setDialogOpen(true)}
                size="lg"
                className="gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                فتح المساعد - الفهم القرائي
              </Button>
              
              <Button
                onClick={() => setDialogOpen(true)}
                size="lg"
                variant="outline"
                className="gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                فتح المساعد - الرياضيات
              </Button>
              
              <Button
                onClick={() => setDialogOpen(true)}
                size="lg"
                variant="secondary"
                className="gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                فتح المساعد - الكتابة الإبداعية
              </Button>
            </div>
            
            {/* Sample text showcase */}
            <div className="mt-6 p-4 bg-primary/5 rounded-lg space-y-3 border border-primary/20">
              <h3 className="font-semibold text-lg">نصوص عربية للمقارنة:</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground">نص عادي:</span>
                  <p className="text-base mt-1">مرحباً بك في منصتي التعليمية للفهم القرائي والمهارات الأساسية</p>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground">نص مُشكَّل كامل:</span>
                  <p className="text-base mt-1">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ</p>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground">نص طويل مُشكَّل:</span>
                  <p className="text-base mt-1 leading-loose">
                    الْفَهْمُ الْقِرَائِيُّ هُوَ الْقُدْرَةُ عَلَى قِرَاءَةِ النَّصِّ وَفَهْمِ مَعْنَاهُ بِشَكْلٍ صَحِيحٍ. 
                    لَا يَتَعَلَّقُ الْأَمْرُ بِقِرَاءَةِ الْكَلِمَاتِ فَقَطْ، بَلْ بِفَهْمِ الْأَفْكَارِ وَالرَّبْطِ بَيْنَهَا.
                  </p>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground">حروف متصلة:</span>
                  <p className="text-base mt-1">القراءة والكتابة والاستماع والتحدث</p>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground">Ligatures:</span>
                  <p className="text-base mt-1">الله - اللَّه - لله - للَّه - لا - ﻻ - الإسلام - الْإِسْلَامُ</p>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground">مع أرقام عربية:</span>
                  <p className="text-base mt-1">الدرس رقم ١٢٣٤٥ من الصف السادس</p>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground">مع أرقام إنجليزية:</span>
                  <p className="text-base mt-1">اقرأ لمدة 15 دقيقة كل يوم لمدة 30 يوماً</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Font Size Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">اختبار أحجام الخط</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">12px (text-xs):</span>
                <p className="text-xs mt-1">الْفَهْمُ الْقِرَائِيُّ مَهَارَةٌ أَسَاسِيَّةٌ</p>
              </div>
              
              <div>
                <span className="text-xs text-muted-foreground">14px (text-sm):</span>
                <p className="text-sm mt-1">الْفَهْمُ الْقِرَائِيُّ مَهَارَةٌ أَسَاسِيَّةٌ</p>
              </div>
              
              <div>
                <span className="text-xs text-muted-foreground">16px (text-base) - Default:</span>
                <p className="text-base mt-1 font-semibold text-primary">الْفَهْمُ الْقِرَائِيُّ مَهَارَةٌ أَسَاسِيَّةٌ</p>
              </div>
              
              <div>
                <span className="text-xs text-muted-foreground">18px (text-lg):</span>
                <p className="text-lg mt-1">الْفَهْمُ الْقِرَائِيُّ مَهَارَةٌ أَسَاسِيَّةٌ</p>
              </div>
              
              <div>
                <span className="text-xs text-muted-foreground">20px (text-xl):</span>
                <p className="text-xl mt-1">الْفَهْمُ الْقِرَائِيُّ مَهَارَةٌ أَسَاسِيَّةٌ</p>
              </div>
              
              <div>
                <span className="text-xs text-muted-foreground">24px (text-2xl):</span>
                <p className="text-2xl mt-1">الْفَهْمُ الْقِرَائِيُّ مَهَارَةٌ أَسَاسِيَّةٌ</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">
                ✓ يجب أن تكون جميع الأحجام أعلاه قابلة للقراءة بوضوح مع عرض التشكيل بشكل صحيح
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Font Weight Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">اختبار أوزان الخط</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-light text-base">300 - خفيف: القراءة والكتابة مَهَارَاتٌ أَسَاسِيَّةٌ في التعليم</p>
            <p className="font-normal text-base">400 - عادي: القراءة والكتابة مَهَارَاتٌ أَسَاسِيَّةٌ في التعليم</p>
            <p className="font-medium text-base">500 - متوسط: القراءة والكتابة مَهَارَاتٌ أَسَاسِيَّةٌ في التعليم</p>
            <p className="font-semibold text-base">600 - نصف سميك: القراءة والكتابة مَهَارَاتٌ أَسَاسِيَّةٌ في التعليم</p>
            <p className="font-bold text-base">700 - سميك: القراءة والكتابة مَهَارَاتٌ أَسَاسِيَّةٌ في التعليم</p>
            <p className="font-extrabold text-base">800 - سميك جداً: القراءة والكتابة مَهَارَاتٌ أَسَاسِيَّةٌ في التعليم</p>
            <p className="font-black text-base">900 - أسود: القراءة والكتابة مَهَارَاتٌ أَسَاسِيَّةٌ في التعليم</p>
          </CardContent>
        </Card>

        {/* Line Height Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">اختبار ارتفاع الأسطر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs text-muted-foreground">ضيق (leading-tight):</span>
              <p className="leading-tight text-base mt-1">
                الْقِرَاءَةُ هِيَ النَّافِذَةُ الَّتِي نُطِلُّ مِنْهَا عَلَى الْعَالَمِ. كُلَّمَا قَرَأْنَا أَكْثَرَ، كُلَّمَا اتَّسَعَتْ مَدَارِكُنَا وَزَادَتْ مَعْرِفَتُنَا. 
                الْقِرَاءَةُ تُنَمِّي الْخَيَالَ وَتُثْرِي اللُّغَةَ وَتُحَسِّنُ التَّفْكِيرَ النَّقْدِيَّ.
              </p>
            </div>
            
            <div>
              <span className="text-xs text-muted-foreground">عادي (leading-normal):</span>
              <p className="leading-normal text-base mt-1">
                الْقِرَاءَةُ هِيَ النَّافِذَةُ الَّتِي نُطِلُّ مِنْهَا عَلَى الْعَالَمِ. كُلَّمَا قَرَأْنَا أَكْثَرَ، كُلَّمَا اتَّسَعَتْ مَدَارِكُنَا وَزَادَتْ مَعْرِفَتُنَا. 
                الْقِرَاءَةُ تُنَمِّي الْخَيَالَ وَتُثْرِي اللُّغَةَ وَتُحَسِّنُ التَّفْكِيرَ النَّقْدِيَّ.
              </p>
            </div>
            
            <div>
              <span className="text-xs text-muted-foreground">واسع (leading-relaxed):</span>
              <p className="leading-relaxed text-base mt-1">
                الْقِرَاءَةُ هِيَ النَّافِذَةُ الَّتِي نُطِلُّ مِنْهَا عَلَى الْعَالَمِ. كُلَّمَا قَرَأْنَا أَكْثَرَ، كُلَّمَا اتَّسَعَتْ مَدَارِكُنَا وَزَادَتْ مَعْرِفَتُنَا. 
                الْقِرَاءَةُ تُنَمِّي الْخَيَالَ وَتُثْرِي اللُّغَةَ وَتُحَسِّنُ التَّفْكِيرَ النَّقْدِيَّ.
              </p>
            </div>
            
            <div>
              <span className="text-xs text-muted-foreground">واسع جداً (leading-loose) - Used in chatbot:</span>
              <p className="leading-loose text-base mt-1 bg-primary/5 p-3 rounded border border-primary/20">
                الْقِرَاءَةُ هِيَ النَّافِذَةُ الَّتِي نُطِلُّ مِنْهَا عَلَى الْعَالَمِ. كُلَّمَا قَرَأْنَا أَكْثَرَ، كُلَّمَا اتَّسَعَتْ مَدَارِكُنَا وَزَادَتْ مَعْرِفَتُنَا. 
                الْقِرَاءَةُ تُنَمِّي الْخَيَالَ وَتُثْرِي اللُّغَةَ وَتُحَسِّنُ التَّفْكِيرَ النَّقْدِيَّ.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comprehensive Font Test Component */}
        <ArabicFontTest />

        {/* Success Checklist */}
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle className="text-2xl text-green-700 flex items-center gap-2">
              ✓ قائمة التحقق من النجاح
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-xl">✓</span>
                <p>يجب أن تظهر جميع النصوص العربية بوضوح مع خط Cairo</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-xl">✓</span>
                <p>يجب أن تكون علامات التشكيل (َ ِ ُ ً ٍ ٌ ْ ّ) واضحة ومرتبطة بالحروف بشكل صحيح</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-xl">✓</span>
                <p>يجب أن تظهر الحروف المتصلة بشكل متصل وليس منفصل</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-xl">✓</span>
                <p>يجب أن تظهر الحروف المركبة (ligatures) مثل لا والله كحرف واحد</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-xl">✓</span>
                <p>يجب أن تكون جميع أحجام النصوص قابلة للقراءة من 12px إلى 24px</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-xl">✓</span>
                <p>يجب أن يعمل المساعد الذكي مع النصوص المُشكَّلة بشكل صحيح</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-xl">✓</span>
                <p>يجب أن يعمل تأثير الآلة الكاتبة (typewriter) بسلاسة مع التشكيل</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-xl">✓</span>
                <p>يجب أن تكون الخطوط واضحة على جميع الخلفيات (فاتحة وداكنة)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chatbot Dialog */}
      <SkillChatbotDialog
        skillId="reading-comprehension"
        skillTitle="الفهم القرائي"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

