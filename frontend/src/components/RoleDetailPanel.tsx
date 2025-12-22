import { memo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Live2DPreview from './Live2DPreview';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export type UserDetail = {
  userId: string;
  name: string;
  avatarLarge: string; // 竖直大图 URL
  tags: string[];
  bio: string; // 详细介绍
};

interface RoleDetailPanelProps {
  className?: string;
  user: UserDetail;
}

interface ExpressionItem {
  name: string;
  file: string;
}

interface MotionItem {
  name: string;
}

function RoleDetailPanelBase({ className, user }: RoleDetailPanelProps) {
  const [expression, setExpression] = useState('default');
  const [expressions, setExpressions] = useState<ExpressionItem[]>([]);
  const [motion, setMotion] = useState<string | undefined>();
  const [motions, setMotions] = useState<MotionItem[]>([]);
  const modelUrl = '/live2d/soyo/model.json';
  const [speaking, setSpeaking] = useState(false);

  // Fetch expressions and motions from model.json
  useEffect(() => {
    const fetchModelData = async () => {
      try {
        const response = await fetch(modelUrl);
        const modelData = await response.json();
        if (modelData.expressions && Array.isArray(modelData.expressions)) {
          setExpressions(modelData.expressions);
        }
        // Motions are stored as an object with motion names as keys
        if (modelData.motions && typeof modelData.motions === 'object') {
          const motionNames = Object.keys(modelData.motions).map((name) => ({ name }));
          setMotions(motionNames);
        }
      } catch (err) {
        console.error('Failed to fetch model data from model.json:', err);
      }
    };
    fetchModelData();
  }, [modelUrl]);

  return (
    <aside
      className={cn(
        'bg-background flex h-full w-full max-w-90 flex-col overflow-y-auto border-l',
        className
      )}
    >
      <div className="p-4">
        <div className="bg-muted aspect-3/4 w-full overflow-hidden rounded-md">
          {/* 竖图 */}
          <Live2DPreview
            modelUrl={modelUrl}
            width={330}
            height={500}
            scale={0.25}
            fallbackImageUrl={user.avatarLarge}
            expression={expression}
            motion={motion}
            speaking={speaking}
          />
        </div>
        <div className="mt-4">
          <div className="truncate text-base font-semibold">{user.name}</div>
          <div className="mt-2">
            {/* Expression selector dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>表情: {expression}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-60 w-56 overflow-y-auto">
                {expressions.map((exp) => (
                  <DropdownMenuItem
                    key={exp.name}
                    onClick={() => setExpression(exp.name)}
                    className={cn('cursor-pointer', expression === exp.name && 'bg-accent')}
                  >
                    {exp.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-2">
            {/* Motion selector dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>动作: {motion ?? '无'}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-60 w-56 overflow-y-auto">
                {motions.map((m) => (
                  <DropdownMenuItem
                    key={m.name}
                    onClick={() => setMotion(m.name)}
                    className={cn('cursor-pointer', motion === m.name && 'bg-accent')}
                  >
                    {m.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button className="mt-2" variant="outline" onClick={() => setSpeaking(!speaking)}>
            {speaking ? 'Stop Speaking' : 'Start Speaking'}
          </Button>
        </div>

        {user.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {user.tags.map((t) => (
              <span
                key={t}
                className="bg-accent text-accent-foreground inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="text-muted-foreground mt-4 text-sm leading-6 wrap-break-word whitespace-pre-wrap">
          {user.bio}
        </div>
      </div>
    </aside>
  );
}

const RoleDetailPanel = memo(RoleDetailPanelBase);
export default RoleDetailPanel;
