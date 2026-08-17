/**
 * Arabic Font Rendering Test Component
 * 
 * This component tests Arabic font rendering with various features:
 * - Basic Arabic characters
 * - Diacritics (تشكيل)
 * - Ligatures and connected forms
 * - Mixed text with numbers
 * - Different font sizes
 * 
 * Used for task 12.3: Configure Arabic font rendering
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ArabicFontTest: React.FC = () => {
  // Test samples with various Arabic features
  const testSamples = [
    {
      title: 'نص عادي',
      text: 'مرحباً بك في منصتي التعليمية',
      description: 'Basic Arabic text without diacritics',
    },
    {
      title: 'نص مُشكَّل',
      text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      description: 'Text with full diacritics (tashkeel)',
    },
    {
      title: 'حروف متصلة',
      text: 'القراءة والكتابة والاستماع',
      description: 'Connected letter forms and ligatures',
    },
    {
      title: 'نص مع أرقام',
      text: 'الدرس رقم ١٢٣٤٥ من الصف السادس',
      description: 'Arabic text with Arabic-Indic numerals',
    },
    {
      title: 'نص طويل مُشكَّل',
      text: 'الْفَهْمُ الْقِرَائِيُّ هُوَ الْقُدْرَةُ عَلَى قِرَاءَةِ النَّصِّ وَفَهْمِ مَعْنَاهُ بِشَكْلٍ صَحِيحٍ. لَا يَتَعَلَّقُ الْأَمْرُ بِقِرَاءَةِ الْكَلِمَاتِ فَقَطْ، بَلْ بِفَهْمِ الْأَفْكَارِ وَالرَّبْطِ بَيْنَهَا.',
      description: 'Long text with comprehensive diacritics',
    },
    {
      title: 'أسئلة وإجابات',
      text: 'كَيْفَ أُحَسِّنُ مَهَارَتِي فِي الْقِرَاءَةِ؟ - اِقْرَأْ بِانْتِظَامٍ كُلَّ يَوْمٍ وَلَوْ لِمُدَّةِ ١٥ دَقِيقَةً.',
      description: 'Question and answer format with diacritics',
    },
  ];

  return (
    <div className="p-6 space-y-4" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">اختبار عرض الخطوط العربية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            يختبر هذا المكون عرض الخطوط العربية مع الميزات المختلفة:
          </div>
          
          {testSamples.map((sample, index) => (
            <div key={index} className="space-y-2 border-b pb-4 last:border-b-0">
              <h3 className="font-semibold text-primary text-lg">
                {sample.title}
              </h3>
              <p className="text-xs text-muted-foreground italic">
                {sample.description}
              </p>
              
              {/* Test at different sizes */}
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-xs text-muted-foreground">حجم صغير (14px): </span>
                  {sample.text}
                </div>
                <div className="text-base">
                  <span className="text-xs text-muted-foreground">حجم متوسط (16px): </span>
                  {sample.text}
                </div>
                <div className="text-lg">
                  <span className="text-xs text-muted-foreground">حجم كبير (18px): </span>
                  {sample.text}
                </div>
                <div className="text-xl">
                  <span className="text-xs text-muted-foreground">حجم أكبر (20px): </span>
                  {sample.text}
                </div>
              </div>
            </div>
          ))}
          
          {/* Font weight tests */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold text-primary text-lg">
              اختبار أوزان الخط
            </h3>
            <div className="space-y-2">
              <p className="font-light">خط رفيع (300): القراءة والكتابة مَهَارَاتٌ أَسَاسِيَّةٌ</p>
              <p className="font-normal">خط عادي (400): القراءة والكتابة مَهَارَاتٌ أَسَاسِيَّةٌ</p>
              <p className="font-medium">خط متوسط (500): القراءة والكتابة مَهَارَاتٌ أَسَاسِيَّةٌ</p>
              <p className="font-semibold">خط سميك (600): القراءة والكتابة مَهَارَاتٌ أَسَاسِيَّةٌ</p>
              <p className="font-bold">خط عريض (700): القراءة والكتابة مَهَارَاتٌ أَسَاسِيَّةٌ</p>
              <p className="font-extrabold">خط عريض جداً (800): القراءة والكتابة مَهَارَاتٌ أَسَاسِيَّةٌ</p>
            </div>
          </div>
          
          {/* Special ligatures test */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold text-primary text-lg">
              اختبار الحروف المركبة (Ligatures)
            </h3>
            <p className="text-base">
              الله - اللَّه - لله - للَّه - لا - ﻻ - الإسلام - الْإِسْلَامُ
            </p>
            <p className="text-base">
              بسم الله الرحمن الرحيم - بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
          
          {/* Line height and spacing test */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold text-primary text-lg">
              اختبار التباعد والارتفاع
            </h3>
            <div className="space-y-4">
              <div className="leading-tight">
                <span className="text-xs text-muted-foreground">ضيق: </span>
                القراءة هي النافذة التي نطل منها على العالم. كلما قرأنا أكثر، كلما اتسعت مداركنا وزادت معرفتنا. القراءة تُنمّي الخيال وتُثري اللغة وتُحسّن التفكير النقدي.
              </div>
              <div className="leading-normal">
                <span className="text-xs text-muted-foreground">عادي: </span>
                القراءة هي النافذة التي نطل منها على العالم. كلما قرأنا أكثر، كلما اتسعت مداركنا وزادت معرفتنا. القراءة تُنمّي الخيال وتُثري اللغة وتُحسّن التفكير النقدي.
              </div>
              <div className="leading-relaxed">
                <span className="text-xs text-muted-foreground">واسع: </span>
                القراءة هي النافذة التي نطل منها على العالم. كلما قرأنا أكثر، كلما اتسعت مداركنا وزادت معرفتنا. القراءة تُنمّي الخيال وتُثري اللغة وتُحسّن التفكير النقدي.
              </div>
            </div>
          </div>
          
          {/* Success indicator */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">
              ✓ إذا كنت ترى كل النصوص أعلاه بوضوح مع التشكيل والحروف المتصلة بشكل صحيح، فإن عرض الخطوط العربية يعمل بشكل مثالي!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
