import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Brain } from 'lucide-react';
import type { Skill } from '@/pages/teacher/TeacherPublicPage';
import { SkillChatbotDialog } from './skill-chatbot';

interface Props {
  skills: Skill[];
}

const PublicSkillList = ({ skills }: Props) => {
  // Dialog state management (Requirement 1.1, 1.5)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [selectedSkillTitle, setSelectedSkillTitle] = useState<string>('');

  // Handle skill container click to open dialog with skill data
  const handleSkillClick = (skillId: string, skillTitle: string) => {
    setSelectedSkillId(skillId);
    setSelectedSkillTitle(skillTitle);
    setDialogOpen(true);
  };

  if (skills.length === 0) {
    return (
      <Card><CardContent className="text-center py-16 text-muted-foreground">
        <Brain className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg">لا توجد مهارات متاحة حالياً</p>
      </CardContent></Card>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        {skills.map((s: Skill) => (
          <Card 
            key={s.skills.id} 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30" 
            onClick={() => handleSkillClick(s.skills.id, s.skills.title)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Brain className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{s.skills.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs
                                   font-medium bg-accent/50 text-accent-foreground`}>
                      {s.skills.fields.subjects.name}
                  </span>
                </div>
                <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Render SkillChatbotDialog with dialog props */}
      {selectedSkillId && (
        <SkillChatbotDialog
          skillId={selectedSkillId}
          skillTitle={selectedSkillTitle}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  );
};

export default PublicSkillList;
