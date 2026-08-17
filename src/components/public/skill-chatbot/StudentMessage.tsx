import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

/**
 * Display student's selected response options.
 * 
 * Props:
 * - content: The student's selected response text
 * - timestamp: When the message was sent
 * 
 * **Validates: Requirements 7.2, 7.3, 12.2, 12.4**
 * 
 * **Task 20.1: Performance Optimization**
 * - Wrapped in React.memo to prevent unnecessary re-renders
 * - Student messages are immutable once added, so default shallow comparison is sufficient
 */
export interface StudentMessageProps {
  content: string;
  timestamp: Date;
}

const StudentMessageComponent: React.FC<StudentMessageProps> = ({
  content,
  timestamp,
}) => {
  // Format timestamp in Arabic locale (ar-SA)
  const formattedTime = timestamp.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div 
      data-testid="student-message" 
      className="flex items-start gap-2 mb-3 rtl:flex-row rtl:justify-start ltr:flex-row-reverse ltr:justify-start"
      role="article"
      aria-label="رسالة من الطالب"
    >
      {/* Student Avatar/Icon - displayed on the left side for RTL */}
      <div 
        className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
        aria-hidden="true"
      >
        <User className="w-4 h-4 text-secondary-foreground" />
      </div>
      
      {/* Message content - left aligned for RTL (opposite of AI messages) with optimized Arabic rendering */}
      <div className="max-w-[75%] sm:max-w-[70%]">
        <Card className="bg-secondary/30 border-secondary/40">
          <CardContent className="p-2.5 sm:p-3">
            <p 
              className="rtl:text-right ltr:text-left leading-relaxed whitespace-pre-wrap text-sm sm:text-base"
              style={{
                fontFeatureSettings: '"liga" 1, "calt" 1',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                lineHeight: '1.6',
                wordSpacing: '0.05em',
              }}
            >
              {content}
            </p>
          </CardContent>
        </Card>
        
        {/* Timestamp displayed below message */}
        <p 
          className="text-xs text-muted-foreground mt-0.5 rtl:text-right ltr:text-left rtl:pr-1 ltr:pl-1"
          aria-label={`وقت الإرسال: ${formattedTime}`}
        >
          {formattedTime}
        </p>
      </div>
    </div>
  );
};

/**
 * Memoized StudentMessage component to prevent unnecessary re-renders
 * Student messages are immutable, so they should never re-render once mounted
 */
export const StudentMessage = React.memo(StudentMessageComponent);
