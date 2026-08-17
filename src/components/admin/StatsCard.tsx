import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  color?: string;
}

export const StatsCard = ({ icon: Icon, value, label, color }: StatsCardProps) => {
  const colorClass = color || 'gradient-primary';
  
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`w-11 h-11 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-primary-foreground" style={color && !color.includes('gradient') ? { color } : undefined} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-muted-foreground text-xs">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};
