import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type Item = {
  id: string;
  name: string;
  type: 'weapon' | 'food' | 'medkit' | 'artifact' | 'junk';
  icon: string;
  quantity: number;
};

type Location = {
  id: string;
  name: string;
  description: string;
  danger: number;
  explored: boolean;
};

type CraftRecipe = {
  id: string;
  name: string;
  requires: { item: string; count: number }[];
  produces: { item: string; count: number };
};

const Index = () => {
  const { toast } = useToast();
  
  const [health, setHealth] = useState(100);
  const [radiation, setRadiation] = useState(15);
  const [hunger, setHunger] = useState(70);
  const [thirst, setThirst] = useState(80);
  const [money, setMoney] = useState(250);
  
  const [inventory, setInventory] = useState<Item[]>([
    { id: '1', name: 'ПМ', type: 'weapon', icon: '🔫', quantity: 1 },
    { id: '2', name: 'Хлеб', type: 'food', icon: '🍞', quantity: 3 },
    { id: '3', name: 'Аптечка', type: 'medkit', icon: '💊', quantity: 2 },
    { id: '4', name: 'Гайки', type: 'junk', icon: '🔩', quantity: 5 },
  ]);
  
  const [locations] = useState<Location[]>([
    { id: '1', name: 'Заброшенный завод', description: 'Старый промышленный комплекс с высокой радиацией', danger: 3, explored: false },
    { id: '2', name: 'Аномалия "Воронка"', description: 'Гравитационная аномалия, богатая артефактами', danger: 5, explored: false },
    { id: '3', name: 'Деревня-призрак', description: 'Покинутое поселение с остатками припасов', danger: 2, explored: false },
    { id: '4', name: 'Военный блокпост', description: 'Разрушенный КПП с оружием и патронами', danger: 4, explored: false },
  ]);
  
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isExploring, setIsExploring] = useState(false);
  
  const craftRecipes: CraftRecipe[] = [
    { 
      id: '1', 
      name: 'Бинты', 
      requires: [{ item: 'Ткань', count: 2 }],
      produces: { item: 'Бинты', count: 1 }
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHunger(prev => Math.max(0, prev - 0.5));
      setThirst(prev => Math.max(0, prev - 0.7));
      
      if (radiation > 50) {
        setHealth(prev => Math.max(0, prev - 0.3));
      }
      
      if (hunger < 20 || thirst < 20) {
        setHealth(prev => Math.max(0, prev - 0.2));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [radiation, hunger, thirst]);

  const useItem = (item: Item) => {
    if (item.type === 'food') {
      setHunger(prev => Math.min(100, prev + 30));
      setThirst(prev => Math.min(100, prev + 10));
      toast({
        title: "Вы поели",
        description: `${item.icon} ${item.name} восстановил силы`,
      });
    } else if (item.type === 'medkit') {
      setHealth(prev => Math.min(100, prev + 40));
      setRadiation(prev => Math.max(0, prev - 10));
      toast({
        title: "Лечение",
        description: `${item.icon} ${item.name} восстановил здоровье`,
      });
    }
    
    setInventory(prev => 
      prev.map(i => 
        i.id === item.id 
          ? { ...i, quantity: i.quantity - 1 }
          : i
      ).filter(i => i.quantity > 0)
    );
  };

  const exploreLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsExploring(true);
    
    setTimeout(() => {
      const radiationIncrease = location.danger * 5;
      setRadiation(prev => Math.min(100, prev + radiationIncrease));
      
      const lootTable = [
        { name: 'Консервы', type: 'food' as const, icon: '🥫', chance: 0.6 },
        { name: 'Патроны', type: 'junk' as const, icon: '📦', chance: 0.5 },
        { name: 'Аптечка', type: 'medkit' as const, icon: '💊', chance: 0.3 },
        { name: 'Артефакт "Глаз"', type: 'artifact' as const, icon: '💎', chance: 0.15 },
      ];
      
      const foundItems: Item[] = [];
      lootTable.forEach(loot => {
        if (Math.random() < loot.chance) {
          foundItems.push({
            id: Date.now() + Math.random().toString(),
            name: loot.name,
            type: loot.type,
            icon: loot.icon,
            quantity: 1,
          });
        }
      });
      
      if (foundItems.length > 0) {
        setInventory(prev => [...prev, ...foundItems]);
        toast({
          title: "Находка!",
          description: `Найдено предметов: ${foundItems.map(i => i.icon + ' ' + i.name).join(', ')}`,
        });
      } else {
        toast({
          title: "Пусто",
          description: "Вы ничего не нашли в этой локации",
          variant: "destructive",
        });
      }
      
      const earnedMoney = Math.floor(Math.random() * 50) + location.danger * 10;
      setMoney(prev => prev + earnedMoney);
      
      setIsExploring(false);
      setSelectedLocation(null);
    }, 3000);
  };

  const getStatusColor = (value: number) => {
    if (value > 70) return 'hsl(var(--primary))';
    if (value > 40) return 'hsl(var(--accent))';
    return 'hsl(var(--destructive))';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="text-center py-6 border-b border-border">
          <h1 className="text-4xl font-bold text-primary text-shadow-glow">S.T.A.L.K.C.R.A.F.T</h1>
          <p className="text-muted-foreground mt-2">Выживание в Зоне</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4 bg-card border-border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Activity" className="text-destructive" />
                Состояние сталкера
              </h2>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="flex items-center gap-2">
                      <Icon name="Heart" size={16} className="text-destructive" />
                      Здоровье
                    </span>
                    <span className="font-bold">{Math.round(health)}%</span>
                  </div>
                  <Progress value={health} className="h-3" style={{ backgroundColor: getStatusColor(health) }} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="flex items-center gap-2">
                      <Icon name="Radiation" size={16} className="text-primary pulse-radiation" />
                      Радиация
                    </span>
                    <span className="font-bold text-primary">{Math.round(radiation)}%</span>
                  </div>
                  <Progress value={radiation} className="h-3 radiation-glow" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="flex items-center gap-2">
                      <Icon name="UtensilsCrossed" size={16} className="text-accent" />
                      Голод
                    </span>
                    <span className="font-bold">{Math.round(hunger)}%</span>
                  </div>
                  <Progress value={hunger} className="h-3" style={{ backgroundColor: getStatusColor(hunger) }} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="flex items-center gap-2">
                      <Icon name="Droplet" size={16} className="text-blue-400" />
                      Жажда
                    </span>
                    <span className="font-bold">{Math.round(thirst)}%</span>
                  </div>
                  <Progress value={thirst} className="h-3" style={{ backgroundColor: getStatusColor(thirst) }} />
                </div>
                
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Icon name="Coins" size={16} className="text-accent" />
                      Рубли
                    </span>
                    <span className="font-bold text-accent text-xl">{money} ₽</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Map" className="text-primary" />
                Локации для исследования
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {locations.map(location => (
                  <Card 
                    key={location.id} 
                    className="p-4 bg-muted border-border hover:border-primary transition-colors cursor-pointer"
                  >
                    <h3 className="font-bold mb-2 flex items-center justify-between">
                      {location.name}
                      <Badge variant={location.danger > 3 ? 'destructive' : 'secondary'}>
                        Опасность: {location.danger}/5
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{location.description}</p>
                    <Button 
                      onClick={() => exploreLocation(location)}
                      disabled={isExploring}
                      className="w-full"
                      variant={location.danger > 3 ? 'destructive' : 'default'}
                    >
                      {isExploring && selectedLocation?.id === location.id ? (
                        <>
                          <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                          Исследование...
                        </>
                      ) : (
                        <>
                          <Icon name="Search" className="mr-2" size={16} />
                          Исследовать
                        </>
                      )}
                    </Button>
                  </Card>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-card border-border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Backpack" className="text-secondary" />
                Инвентарь
              </h2>
              
              <div className="space-y-2">
                {inventory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Инвентарь пуст</p>
                ) : (
                  inventory.map(item => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 bg-muted rounded border border-border hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="font-semibold text-sm">{item.name}</p>
                          <Badge variant="outline" className="text-xs">x{item.quantity}</Badge>
                        </div>
                      </div>
                      {(item.type === 'food' || item.type === 'medkit') && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => useItem(item)}
                        >
                          <Icon name="Package" size={14} />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Hammer" className="text-accent" />
                Крафт
              </h2>
              
              <div className="space-y-2">
                {craftRecipes.map(recipe => (
                  <div key={recipe.id} className="p-3 bg-muted rounded border border-border">
                    <p className="font-semibold mb-2">{recipe.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Требуется: {recipe.requires.map(r => `${r.item} x${r.count}`).join(', ')}
                    </p>
                    <Button size="sm" variant="outline" className="w-full" disabled>
                      <Icon name="Hammer" size={14} className="mr-1" />
                      Создать
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Соберите ресурсы для крафта
                </p>
              </div>
            </Card>
          </div>
        </div>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Icon name="Radio" className="text-primary animate-pulse" size={20} />
              <p className="text-sm text-muted-foreground">
                "Внимание всем сталкерам! Зафиксирован выброс в секторе Янтарь. Рекомендуется укрытие."
              </p>
            </div>
            <Badge variant="destructive" className="pulse-radiation">
              ТРЕВОГА
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
