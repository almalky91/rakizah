'use client';

import { useState, useEffect } from 'react';
import { gameApi } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Brain, Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Game as GameType } from '@/db/schema/content';

const GameCenter = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<GameType[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [gameTitle, setGameTitle] = useState('');
  const [gameType, setGameType] = useState<'wheel' | 'memory'>('wheel');
  const [wheelItems, setWheelItems] = useState(['', '', '', '']);
  const [memoryPairs, setMemoryPairs] = useState([{ term: '', match: '' }]);

  const fetchGames = async () => {
    if (!user) return;
    try {
      const data = await gameApi.list(user.id);
      setGames(data);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  useEffect(() => { if (user) fetchGames(); }, [user]);

  const resetForm = () => {
    setGameTitle('');
    setGameType('wheel');
    setWheelItems(['', '', '', '']);
    setMemoryPairs([{ term: '', match: '' }]);
    setEditingId(null);
  };

  const openEdit = (g: GameType) => {
    setEditingId(g.id);
    setGameTitle(g.title);
    setGameType(g.gameType as 'wheel' | 'memory');
    const config = g.config as any;
    if (g.gameType === 'wheel') {
      setWheelItems(config?.items?.length ? config.items : ['', '', '', '']);
    } else {
      setMemoryPairs(config?.pairs?.length ? config.pairs : [{ term: '', match: '' }]);
    }
    setOpen(true);
  };

  const saveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = gameType === 'wheel'
      ? { items: wheelItems.filter(Boolean) }
      : { pairs: memoryPairs.filter(p => p.term && p.match) };

    try {
      if (editingId) {
        await gameApi.update(editingId, {
          title: gameTitle,
          gameType: gameType,
          config,
        });
        toast.success('تم تحديث اللعبة');
      } else {
        await gameApi.create({
          title: gameTitle,
          gameType: gameType,
          config,
        });
        toast.success('تم حفظ اللعبة');
      }
      resetForm();
      setOpen(false);
      fetchGames();
    } catch (error) {
      toast.error(editingId ? 'فشل في تحديث اللعبة' : 'فشل في حفظ اللعبة');
    }
  };

  const deleteGame = async (id: string) => {
    try {
      await gameApi.delete(id);
      toast.success('تم حذف اللعبة');
      fetchGames();
    } catch (error) {
      toast.error('فشل في حذف اللعبة');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          مركز المهارات
        </h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="w-4 h-4 ml-1" />إضافة مهارة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? 'تعديل اللعبة' : 'إنشاء لعبة جديدة'}</DialogTitle></DialogHeader>
            <form onSubmit={saveGame} className="space-y-4">
              <div className="space-y-2">
                <Label>اسم اللعبة</Label>
                <Input value={gameTitle} onChange={e => setGameTitle(e.target.value)} required placeholder="اسم اللعبة" />
              </div>
              <div className="space-y-2">
                <Label>نوع اللعبة</Label>
                <Select value={gameType} onValueChange={(v: 'wheel' | 'memory') => setGameType(v)} disabled={!!editingId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wheel">العجلة الدوارة</SelectItem>
                    <SelectItem value="memory">لعبة الذاكرة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {gameType === 'wheel' ? (
                <div className="space-y-3">
                  <Label>عناصر العجلة</Label>
                  {wheelItems.map((item, i) => (
                    <Input key={i} value={item} onChange={e => {
                      const items = [...wheelItems];
                      items[i] = e.target.value;
                      setWheelItems(items);
                    }} placeholder={`العنصر ${i + 1}`} />
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setWheelItems([...wheelItems, ''])}>
                    <Plus className="w-3 h-3 ml-1" />إضافة عنصر
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label>أزواج الذاكرة</Label>
                  {memoryPairs.map((pair, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={pair.term} onChange={e => {
                        const pairs = [...memoryPairs];
                        pairs[i].term = e.target.value;
                        setMemoryPairs(pairs);
                      }} placeholder="المصطلح" />
                      <Input value={pair.match} onChange={e => {
                        const pairs = [...memoryPairs];
                        pairs[i].match = e.target.value;
                        setMemoryPairs(pairs);
                      }} placeholder="المطابق" />
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setMemoryPairs([...memoryPairs, { term: '', match: '' }])}>
                    <Plus className="w-3 h-3 ml-1" />إضافة زوج
                  </Button>
                </div>
              )}

              <Button type="submit" variant="hero" className="w-full">{editingId ? 'تحديث اللعبة' : 'حفظ اللعبة'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {games.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد ألعاب بعد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(g => (
            <Card key={g.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{g.title}</h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent-foreground">
                      {g.gameType === 'wheel' ? 'عجلة دوارة' : 'لعبة ذاكرة'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(g)} className="text-primary hover:text-primary">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteGame(g.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameCenter;
