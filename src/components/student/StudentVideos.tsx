import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Play } from 'lucide-react';

const StudentVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('videos')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });
      setVideos(data || []);
    };
    fetch();
  }, []);

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const handlePlay = async (video: any) => {
    setPlaying(video.id);
    // Increment view
    await supabase.from('videos').update({ views: (video.views || 0) + 1 }).eq('id', video.id);
    // Log view
    await supabase.from('video_views').insert({
      video_id: video.id,
      student_id: user?.id,
      teacher_id: video.teacher_id,
    });
  };

  return (
    <div className="space-y-6">
      {videos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Video className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد فيديوهات متاحة حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(v => {
            const ytId = getYouTubeId(v.youtube_url);
            return (
              <Card key={v.id} className="overflow-hidden group cursor-pointer" onClick={() => handlePlay(v)}>
                <div className="aspect-video bg-muted relative">
                  {playing === v.id && ytId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      {ytId && <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={v.title} className="w-full h-full object-cover" />}
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                          <Play className="w-8 h-8 text-primary-foreground mr-[-2px]" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 truncate">{v.title}</h3>
                  <p className="text-xs text-muted-foreground">{(v.profiles as any)?.full_name || 'معلم'}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentVideos;
