'use client';

import { useState, useEffect } from 'react';
import { videoApi } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Video, Eye, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Video as VideoType } from '@/db/schema/content';

const VideoCenter = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchVideos = async () => {
    if (!user) return;
    try {
      const data = await videoApi.list(user.id);
      setVideos(data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  useEffect(() => { if (user) fetchVideos(); }, [user]);

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const openEdit = (v: VideoType) => {
    setEditingId(v.id);
    setTitle(v.title);
    setUrl(v.youtubeUrl);
    setOpen(true);
  };

  const resetForm = () => {
    setTitle(''); setUrl(''); setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getYouTubeId(url)) {
      toast.error('يرجى إدخال رابط يوتيوب صحيح');
      return;
    }

    try {
      if (editingId) {
        await videoApi.update(editingId, { title, youtubeUrl: url });
        toast.success('تم تحديث الفيديو');
      } else {
        await videoApi.create({ title, youtubeUrl: url });
        toast.success('تم إضافة الفيديو');
      }
      resetForm();
      setOpen(false);
      fetchVideos();
    } catch (error) {
      toast.error(editingId ? 'فشل في تحديث الفيديو' : 'فشل في إضافة الفيديو');
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      await videoApi.delete(id);
      toast.success('تم حذف الفيديو');
      fetchVideos();
    } catch (error) {
      toast.error('فشل في حذف الفيديو');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Video className="w-6 h-6 text-primary" />
          مركز الفيديو
        </h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="w-4 h-4 ml-1" />إضافة فيديو</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'تعديل الفيديو' : 'إضافة فيديو يوتيوب'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>عنوان الفيديو</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="مثال: درس الرياضيات - الوحدة الأولى" />
              </div>
              <div className="space-y-2">
                <Label>رابط يوتيوب</Label>
                <Input value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://youtube.com/watch?v=..." dir="ltr" />
              </div>
              <Button type="submit" variant="hero" className="w-full">{editingId ? 'تحديث' : 'إضافة'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Video className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد فيديوهات بعد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(v => {
            const ytId = getYouTubeId(v.youtubeUrl);
            return (
              <Card key={v.id} className="overflow-hidden group">
                <div className="aspect-video bg-muted relative">
                  {ytId && <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={v.title} className="w-full h-full object-cover" />}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 truncate">{v.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {v.views || 0} مشاهدة
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(v)} className="text-primary hover:text-primary">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteVideo(v.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VideoCenter;
