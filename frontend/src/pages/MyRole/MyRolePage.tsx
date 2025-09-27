import { useEffect, useState } from 'react';
import { fetchHistroyRoleList, type RoleData } from '@/api/roles';
import RoleCard from '@/components/RoleCard';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';

function MyRolePage() {
  const [roleList, setRoleList] = useState<RoleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchRoles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchHistroyRoleList();
        setRoleList(data);
      } catch (err) {
        console.error('获取历史角色失败:', err);
        setError('获取历史角色失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [isLoggedIn]);

  return (
    <>
      <div className="bg-background/50 sticky top-0 z-10 flex items-center p-4 backdrop-blur-xl">
        <span className="text-primary text-lg font-bold">我的历史聊天角色</span>
      </div>

      {!isLoggedIn ? (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-muted-foreground mb-4 text-center">请先登录以查看您的历史聊天角色</p>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <span>加载中...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="mb-4 text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>重试</Button>
        </div>
      ) : roleList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-muted-foreground mb-4 text-center">您还没有历史聊天角色</p>
          <Button onClick={() => navigate('/')}>探索角色</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 px-4 md:grid-cols-2 lg:grid-cols-4">
          {roleList.map((role) => (
            <RoleCard
              key={role.roleId}
              id={role.roleId}
              name={role.roleName}
              description={role.short_info}
              image={role.avatarURL}
              collections={role.favoriteCount}
              likes={role.likesCount}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default MyRolePage;
