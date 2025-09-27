import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface TabsDemoProps {
  onTabChange?: (tab: string) => void;
}

function TabsDemo({ onTabChange }: TabsDemoProps) {
  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // 注册表单状态
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 表单错误状态
  const [errors, setErrors] = useState({
    loginEmail: '',
    loginPassword: '',
    registerEmail: '',
    registerPassword: '',
    registerConfirm: '',
  });

  // 表单提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理 tab 变化
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  // 处理登录表单变化
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLoginForm({
      ...loginForm,
      [id === 'login-email' ? 'email' : 'password']: value,
    });

    // 清除对应的错误信息
    if (id === 'login-email') {
      setErrors({ ...errors, loginEmail: '' });
    } else if (id === 'login-password') {
      setErrors({ ...errors, loginPassword: '' });
    }
  };

  // 处理注册表单变化
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let field = '';

    if (id === 'register-email') field = 'email';
    else if (id === 'register-password') field = 'password';
    else if (id === 'register-confirm') field = 'confirmPassword';

    setRegisterForm({
      ...registerForm,
      [field]: value,
    });

    // 清除对应的错误信息
    if (id === 'register-email') {
      setErrors({ ...errors, registerEmail: '' });
    } else if (id === 'register-password') {
      setErrors({ ...errors, registerPassword: '' });
    } else if (id === 'register-confirm') {
      setErrors({ ...errors, registerConfirm: '' });
    }
  };

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // 处理登录提交
  const handleLoginSubmit = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!loginForm.email) {
      newErrors.loginEmail = '请输入邮箱地址';
      valid = false;
    } else if (!validateEmail(loginForm.email)) {
      newErrors.loginEmail = '请输入有效的邮箱地址';
      valid = false;
    }

    if (!loginForm.password) {
      newErrors.loginPassword = '请输入密码';
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      setIsSubmitting(true);
      // 这里可以添加实际的登录逻辑，例如调用 API
      console.log('登录表单提交', loginForm);

      // 模拟 API 调用
      setTimeout(() => {
        setIsSubmitting(false);
        // 登录成功后的逻辑
      }, 1500);
    }
  };

  // 处理注册提交
  const handleRegisterSubmit = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!registerForm.email) {
      newErrors.registerEmail = '请输入邮箱地址';
      valid = false;
    } else if (!validateEmail(registerForm.email)) {
      newErrors.registerEmail = '请输入有效的邮箱地址';
      valid = false;
    }

    if (!registerForm.password) {
      newErrors.registerPassword = '请输入密码';
      valid = false;
    } else if (registerForm.password.length < 6) {
      newErrors.registerPassword = '密码长度至少为6位';
      valid = false;
    }

    if (!registerForm.confirmPassword) {
      newErrors.registerConfirm = '请确认密码';
      valid = false;
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.registerConfirm = '两次输入的密码不一致';
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      setIsSubmitting(true);
      // 这里可以添加实际的注册逻辑，例如调用 API
      console.log('注册表单提交', registerForm);

      // 模拟 API 调用
      setTimeout(() => {
        setIsSubmitting(false);
        // 注册成功后的逻辑
      }, 1500);
    }
  };

  return (
    <Tabs defaultValue="login" onValueChange={handleTabChange}>
      <TabsList className="mb-2 grid w-full grid-cols-2">
        <TabsTrigger value="login">登录</TabsTrigger>
        <TabsTrigger value="register">注册</TabsTrigger>
      </TabsList>
      <TabsContent value="login" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">邮箱</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="请输入邮箱地址"
            value={loginForm.email}
            onChange={handleLoginChange}
            className={cn(errors.loginEmail && 'border-danger')}
          />
          {errors.loginEmail && <p className="text-danger text-sm">{errors.loginEmail}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">密码</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="请输入密码"
            value={loginForm.password}
            onChange={handleLoginChange}
            className={cn(errors.loginPassword && 'border-danger')}
          />
          {errors.loginPassword && <p className="text-danger text-sm">{errors.loginPassword}</p>}
        </div>
        <div className="mt-8 flex items-center justify-between">
          <Button className="pl-0" variant="link">
            忘记密码
          </Button>
          <Button className="px-8" onClick={handleLoginSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? '登录中...' : '登录'}
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="register" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="register-email">邮箱</Label>
          <Input
            id="register-email"
            type="email"
            placeholder="请输入邮箱地址"
            value={registerForm.email}
            onChange={handleRegisterChange}
            className={cn(errors.registerEmail && 'border-danger')}
          />
          {errors.registerEmail && <p className="text-danger text-sm">{errors.registerEmail}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">密码</Label>
          <Input
            id="register-password"
            type="password"
            placeholder="请设置密码"
            value={registerForm.password}
            onChange={handleRegisterChange}
            className={cn(errors.registerPassword && 'border-danger')}
          />
          {errors.registerPassword && (
            <p className="text-danger text-sm">{errors.registerPassword}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-confirm">确认密码</Label>
          <Input
            id="register-confirm"
            type="password"
            placeholder="请再次输入密码"
            value={registerForm.confirmPassword}
            onChange={handleRegisterChange}
            className={cn(errors.registerConfirm && 'border-danger')}
          />
          {errors.registerConfirm && (
            <p className="text-danger text-sm">{errors.registerConfirm}</p>
          )}
        </div>
        <div className="mt-8 flex">
          <Button className="w-full" onClick={handleRegisterSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? '注册中...' : '注册'}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [activeTab, setActiveTab] = useState<string>('login');

  // 根据当前 tab 获取标题
  const getTitle = () => {
    return activeTab === 'login' ? '账号登录' : '注册新账号';
  };

  // 处理 tab 变化
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <TabsDemo onTabChange={handleTabChange} />
      </DialogContent>
    </Dialog>
  );
}
