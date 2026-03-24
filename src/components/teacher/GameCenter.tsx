import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Gamepad2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Game {
  id: string;
  title: string;
  game_type: 'wheel' | 'memory';
  config: any;
  created_at: string;
}

const GameCenter = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [open, setOpen] = useState(false);
  const [gameTitle, setGameTitle] = useState('');
  const [gameType, setGameType] = useState<'wheel' | 'memory'>('wheel');
  const [wheelItems, setWheelItems] = useState(['', '', '', '']);
  const [memoryPairs, setMemoryPairs] = useState([{ term: '', match: '' }]);

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('teacher_id', user?.id)
      .order('created_at', { ascending: false });
    setGames((data as any) || []);
  };

  useEffect(() => { if (user) fetchGames(); }, [user]);

  const saveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = gameType === 'wheel' ? { items: wheelItems.filter(Boolean) } : { pairs: memoryPairs.filter(p => p.term && p.match) };
    
    const { error } = await supabase.from('games').insert({
      title: gameTitle,
      game_type: gameType,
      config,
      teacher_id: user?.id,
    });
    if (error) { toast.error('فشل في حفظ اللعبة'); return; }
    toast.success('تم حفظ اللعبة');
    resetForm();
    setOpen(false);
    fetchGames();
  };

  const resetForm = () => {
    setGameTitle('');
    setGameType('wheel');
    setWheelItems(['', '', '', '']);
    setMemoryPairs([{ term: '', match: '' }]);
  };

  const deleteGame = async (id: string) => {
    await supabase.from('games').delete().eq('id', id);
    toast.success('تم حذف اللعبة');
    fetchGames();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-primary" />
          مركز الألعاب
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="w-4 h-4 ml-1" />إنشاء لعبة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>إنشاء لعبة جديدة</DialogTitle></DialogHeader>
            <form onSubmit={saveGame} className="space-y-4">
              <div className="space-y-2">
                <Label>اسم اللعبة</Label>
                <Input value={gameTitle} onChange={e => setGameTitle(e.target.value)} required placeholder="اسم اللعبة" />
              </div>
              <div className="space-y-2">
                <Label>نوع اللعبة</Label>
                <Select value={gameType} onValueChange={(v: 'wheel' | 'memory') => setGameType(v)}>
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

              <Button type="submit" variant="hero" className="w-full">حفظ اللعبة</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {games.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
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
                      {g.game_type === 'wheel' ? 'عجلة دوارة' : 'لعبة ذاكرة'}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteGame(g.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
