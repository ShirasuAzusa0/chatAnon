import { Card } from '@/components/ui/card';
import { SmilePlus } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import LoginDialog from './LoginDialog';
import NewRoleDialog, { type NewRoleFormData } from './NewRoleDialog';
import { createCustomRole } from '@/api/roles';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

function NewRoleCard() {
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useUserStore();

  const handleCreateNewRole = () => {
    if (!isLoggedIn) {
      setIsLoginDialogOpen(true);
      // TODO: 保持上下文，让登录后能够直接打开新建角色弹窗
      return;
    }
    if (!isNewRoleDialogOpen) setIsNewRoleDialogOpen(true);
  };

  const handleSubmit = async (data: NewRoleFormData) => {
    try {
      const result = data.attachment
        ? await createCustomRole(data.roleName, data.description, data.tags, data.attachment)
        : await createCustomRole(data.roleName, data.description, data.tags);

      toast.success(`角色 ${result.roleName} 已成功创建`);

      setIsNewRoleDialogOpen(false);
      navigate(`/role-info/${result.roleId}`);
    } catch (error) {
      console.error('创建角色失败:', error);
      toast('创建角色时发生错误，请稍后重试');
    }
  };

  return (
    <>
      <Card className="flex flex-col items-center justify-center overflow-hidden transition-shadow duration-300 hover:shadow-lg">
        <div className="flex flex-col items-center justify-center gap-4 p-4">
          <SmilePlus className="text-muted-foreground h-20 w-20" />
          <span>没有找到想要的角色？</span>
          <Button className="w-full" onClick={handleCreateNewRole}>
            新建一个
          </Button>
        </div>
      </Card>
      <LoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
      <NewRoleDialog
        open={isNewRoleDialogOpen}
        onOpenChange={setIsNewRoleDialogOpen}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export default NewRoleCard;
