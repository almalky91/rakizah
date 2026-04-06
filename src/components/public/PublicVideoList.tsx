import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Play, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface VideoItem {
  id: string;
  title: string;
  youtube_url: string;
  views: number;
}

interface Props {
  videos: VideoItem[];
  studentName?: string;
  teacherId?: string;
  onVideoWatched?: () => void;
}

// Load YouTube IFrame API once
let ytApiLoaded = false;
let ytApiReady = false;
const ytReadyCallbacks: (() => void)[] = [];

function loadYTApi() {
  if (ytApiLoaded) return;
  ytApiLoaded = true;
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
  (window as any).onYouTubeIframeAPIReady = () => {
    ytApiReady = true;
    ytReadyCallbacks.forEach(cb => cb());
    ytReadyCallbacks.length = 0;
  };
}

function onYTReady(cb: () => void) {
  if (ytApiReady) cb();
  else ytReadyCallbacks.push(cb);
}

const PublicVideoList = ({ videos, studentName, teacherId, onVideoWatched }: Props) => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const playerRef = useRef<any>(null);
  const checkIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    loadYTApi();
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, []);

  const recordView = useCallback(async (videoId: string) => {
    if (!studentName || !teacherId || watched.has(videoId)) return;
    setWatched(prev => new Set(prev).add(videoId));
    await supabase.from('public_video_views' as any).insert({
      video_id: videoId,
      teacher_id: teacherId,
      student_name: studentName,
    });
    onVideoWatched?.();
  }, [studentName, teacherId, watched, onVideoWatched]);

  const startPlayer = useCallback((videoId: string, ytId: string) => {
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch {}
      playerRef.current = null;
    }

    onYTReady(() => {
      const YT = (window as any).YT;
      if (!YT?.Player) return;

      playerRef.current = new YT.Player(`yt-player-${videoId}`, {
        videoId: ytId,
        playerVars: { autoplay: 1, rel: 0 },
        events: {
          onReady: (event: any) => {
            // Start checking watch progress
            checkIntervalRef.current = window.setInterval(() => {
              try {
                const player = event.target;
                const current = player.getCurrentTime();
                const duration = player.getDuration();
                if (duration > 0 && current / duration > 0.5) {
                  recordView(videoId);
                  if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
                }
              } catch {}
            }, 3000);
          },
        },
      });
    });
  }, [recordView]);

  const handlePlay = (videoId: string, ytId: string | null) => {
    if (playing === videoId) {
      setPlaying(null);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
      return;
    }
    setPlaying(videoId);
    if (ytId) {
      setTimeout(() => startPlayer(videoId, ytId), 100);
    }
  };

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
          <Card key={v.id} className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 border-border/50" onClick={() => handlePlay(v.id, ytId)}>
            <div className="aspect-video bg-muted relative">
              {playing === v.id && ytId ? (
                <div id={`yt-player-${v.id}`} className="w-full h-full" />
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
