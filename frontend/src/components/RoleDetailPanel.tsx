import { memo } from 'react';
import { cn } from '@/lib/utils';

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

function RoleDetailPanelBase({ className, user }: RoleDetailPanelProps) {
  return (
    <aside
      className={cn(
        'border-l flex h-full w-full max-w-[360px] flex-col overflow-y-auto bg-background',
        className
      )}
    >
      <div className="p-4">
        <div className="aspect-[3/4] w-full overflow-hidden rounded-md bg-muted">
          {/* 竖图 */}
          <img
            src={user.avatarLarge}
            alt={user.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="mt-4">
          <div className="text-base font-semibold truncate">{user.name}</div>
        </div>

        {user.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {user.tags.map((t) => (
              <span
                key={t}
                className="border bg-accent text-accent-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
          {user.bio}
        </div>
      </div>
    </aside>
  );
}

const RoleDetailPanel = memo(RoleDetailPanelBase);
export default RoleDetailPanel;
