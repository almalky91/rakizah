import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Play, Eye } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  youtube_url: string;
  views: number;
}

interface Props {
  videos: VideoItem[];
}

const PublicVideoList = ({ videos }: Props) => {
  const [playing, setPlaying] = useState<string | null>(null);

  if (videos.length === 0) {
    return (
      <Card><CardContent className="text-center py-16 text-muted-foreground">
        <Video className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg">لا توجد فيديوهات متاحة حالياً</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {videos.map(v => {
        const ytMatch = v.youtube_url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
        const ytId = ytMatch ? ytMatch[1] : null;
        return (
          <Card key={v.id} className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 border-border/50" onClick={() => setPlaying(playing === v.id ? null : v.id)}>
            <div className="aspect-video bg-muted relative">
              {playing === v.id && ytId ? (
                <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
              ) : (
                <>
                  {ytId && <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={v.title} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                      <Play className="w-7 h-7 text-primary-foreground" />
                    </div>
                  </div>
                </>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold truncate">{v.title}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{v.views || 0} مشاهدة</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PublicVideoList;
