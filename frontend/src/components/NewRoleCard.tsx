import { Card } from '@/components/ui/card';
import { SmilePlus } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import LoginDialog from './LoginDialog';
import NewRoleDialog from './NewRoleDialog';

function NewRoleCard() {
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const { isLoggedIn } = useUserStore();

  const handleCreateNewRole = () => {
    if (!isLoggedIn) {
      setIsLoginDialogOpen(true);
      // TODO: 保持上下文，让登录后能够直接打开新建角色弹窗
      return;
    }
    if (!isNewRoleDialogOpen) setIsNewRoleDialogOpen(true);
  };

  return (
    <>
      <Card className="flex flex-col items-center justify-center overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col items-center justify-center gap-4 p-4">
          <SmilePlus className="w-20 h-20 text-muted-foreground" />
          <span>没有找到想要的角色？</span>
          <Button className="w-full" onClick={handleCreateNewRole}>
            新建一个
          </Button>
        </div>
      </Card>
      <LoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
      <NewRoleDialog open={isNewRoleDialogOpen} onOpenChange={setIsNewRoleDialogOpen} />
    </>
  );
}

export default NewRoleCard;
