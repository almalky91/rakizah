'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ArrowLeft } from 'lucide-react';
import type { Quiz } from '@/db/schema/content';

interface Props {
  quizzes: Quiz[];
  onStartQuiz: (quiz: Quiz) => void;
}

const PublicQuizList = ({ quizzes, onStartQuiz }: Props) => {
  if (quizzes.length === 0) {
    return (
      <Card><CardContent className="text-center py-16 text-muted-foreground">
        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg">لا توجد اختبارات متاحة حالياً</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {quizzes.map(q => (
        <Card key={q.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30" onClick={() => onStartQuiz(q)}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{q.title}</h3>
                <p className="text-sm text-muted-foreground">{JSON.parse(q.questions)?.length} سؤال</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PublicQuizList;
