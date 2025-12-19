import { useParams, useNavigate } from 'react-router';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heart, Star, Share2, AlertCircle } from 'lucide-react';
import { fetchRoleDetail, type RoleDetailInfo } from '@/api/roles';
import { createChatSession } from '@/api/chat';
import { useUserStore } from '@/stores/userStore';

function RoleInfoPage() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUserStore();
  const [roleData, setRoleData] = useState<RoleDetailInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isStartingChat, setIsStartingChat] = useState<boolean>(false);

  useEffect(() => {
    const loadRoleData = async () => {
      if (!roleId) {
        setError('未找到角色ID');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchRoleDetail(Number(roleId));
        setRoleData(data);
        setLoading(false);
      } catch (err) {
        console.error('加载角色信息失败:', err);
        setError('加载角色信息失败');
        setLoading(false);
      }
    };

    loadRoleData();
  }, [roleId]);

  // 执行开始聊天的核心逻辑
  const executeStartChat = useCallback(async () => {
    if (!roleData || !user) {
      alert('角色信息加载中，请稍后再试');
      return;
    }

    setIsStartingChat(true);
    try {
      // 调用 createChatSession API
      const chatSession = await createChatSession(roleData.roleId, user.userId);
      // 跳转到聊天页面/chat/:chatId
      navigate(`/chat/${chatSession.sessionId}`);
    } catch (err) {
      console.error('创建聊天失败:', err);
      alert('创建聊天失败，请稍后再试');
    } finally {
      setIsStartingChat(false);
    }
  }, [roleData, user, navigate]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (roleData) {
      setRoleData({
        ...roleData,
        likesCount: isLiked ? roleData.likesCount - 1 : roleData.likesCount + 1,
      });
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (roleData) {
      setRoleData({
        ...roleData,
        favoriteCount: isFavorite ? roleData.favoriteCount - 1 : roleData.favoriteCount + 1,
      });
    }
  };

  const handleStartChat = async () => {
    // 检查用户登录状态
    if (!isLoggedIn || !user) {
      // 跳转首页
      navigate('/');
      return;
    }

    // 如果已登录，直接执行开始聊天
    await executeStartChat();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* 角色头像 */}
              <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border shadow-sm md:h-48 md:w-48">
                {roleData?.avatarURL && (
                  <img
                    src={roleData.avatarURL}
                    alt={roleData.roleName}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* 角色信息 */}
              <div className="flex-1">
                <CardTitle className="mb-2 text-2xl font-bold md:text-3xl">
                  {roleData?.roleName}
                </CardTitle>

                <div className="mt-4 flex items-center gap-4">
                  <Button
                    variant={isLiked ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2 transition-all"
                    onClick={handleLike}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{roleData?.likesCount || 0}</span>
                  </Button>

                  <Button
                    variant={isFavorite ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2 transition-all"
                    onClick={handleFavorite}
                  >
                    <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                    <span>{roleData?.favoriteCount || 0}</span>
                  </Button>

                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    <span>分享</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">角色描述</h3>
              <p className="text-muted-foreground leading-relaxed">{roleData?.description}</p>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-center">
              {!isLoggedIn ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">请先登录后再开始聊天</span>
                  </div>
                  <Button className="w-full md:w-auto" onClick={handleStartChat}>
                    返回首页
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full md:w-auto"
                  onClick={handleStartChat}
                  disabled={isStartingChat}
                >
                  {isStartingChat ? '创建聊天中...' : '开始聊天'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default RoleInfoPage;
