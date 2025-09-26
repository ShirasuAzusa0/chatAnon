import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heart, Star, Share2 } from 'lucide-react';

// 角色数据接口定义
interface RoleData {
  roleId: number;
  roleName: string;
  likesCount: number;
  favoriteCount: number;
  avatarURL: string; // 角色图片URL
  discription: string; // 角色描述
}

// Mock数据函数
const fetchRoleData = async (id: string): Promise<RoleData> => {
  // 模拟API请求延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 返回模拟数据
  return {
    roleId: parseInt(id),
    roleName: `角色${id}`,
    likesCount: Math.floor(Math.random() * 1000),
    favoriteCount: Math.floor(Math.random() * 500),
    avatarURL: `https://api.dicebear.com/7.x/personas/svg?seed=${id}`, // 使用DiceBear生成随机头像
    discription: `这是角色${id}的详细描述。这个角色拥有独特的性格特点和背景故事，可以在各种场景中扮演不同的角色。这个角色可能是一个冒险家、一个科学家、一个艺术家，或者是一个普通人，但他们都有着自己的故事和经历。通过与这个角色互动，你可以探索不同的可能性和情景，创造出独特的对话和故事。`,
  };
};

function RoleInfoPage() {
  const { roleId } = useParams();
  const [roleData, setRoleData] = useState<RoleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    const loadRoleData = async () => {
      if (!roleId) {
        setError('未找到角色ID');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchRoleData(roleId);
        setRoleData(data);
        setLoading(false);
      } catch {
        setError('加载角色信息失败');
        setLoading(false);
      }
    };

    loadRoleData();
  }, [roleId]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex flex-col md:flex-row gap-6">
              {/* 角色头像 */}
              <div className="flex-shrink-0 w-32 h-32 md:w-48 md:h-48 rounded-lg overflow-hidden border shadow-sm">
                {roleData?.avatarURL && (
                  <img
                    src={roleData.avatarURL}
                    alt={roleData.roleName}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* 角色信息 */}
              <div className="flex-1">
                <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
                  {roleData?.roleName}
                </CardTitle>

                <div className="flex items-center gap-4 mt-4">
                  <Button
                    variant={isLiked ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2 transition-all"
                    onClick={handleLike}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{roleData?.likesCount || 0}</span>
                  </Button>

                  <Button
                    variant={isFavorite ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2 transition-all"
                    onClick={handleFavorite}
                  >
                    <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    <span>{roleData?.favoriteCount || 0}</span>
                  </Button>

                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
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
              <p className="text-muted-foreground leading-relaxed">{roleData?.discription}</p>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-center">
              <Button className="w-full md:w-auto">开始聊天</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default RoleInfoPage;
