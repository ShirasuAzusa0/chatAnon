import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import LoginDialog from './LoginDialog';

export function UserInfo() {
  const { user, isLoggedIn, logout } = useUserStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDialogOpen(false);
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="flex items-center justify-between w-full">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setIsLoginDialogOpen(true)}
        >
          <LogIn className="h-4 w-4" />
          <span className="group-data-[state=collapsed]:hidden">登录</span>
        </Button>
        <LoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.userName} />
          <AvatarFallback>{user.userName.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden group-data-[state=collapsed]:hidden">
          <span className="text-sm font-medium truncate">{user.userName}</span>
          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="group-data-[state=collapsed]:hidden">
            <LogOut className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出登录</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要退出登录吗？退出后需要重新登录才能使用账户功能。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>确认退出</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
