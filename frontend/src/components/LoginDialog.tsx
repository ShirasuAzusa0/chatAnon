import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { login, register, fetchUserInfo, fetchCaptcha } from '@/api/user';
import { encrypt } from '@/lib/encrypt';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'sonner';

interface TabsDemoProps {
  onTabChange?: (tab: string) => void;
}

function TabsDemo({ onTabChange }: TabsDemoProps) {
  // 使用userStore
  const { login: loginUser } = useUserStore();

  // 验证码状态
  const [captchaData, setCaptchaData] = useState({
    key: '',
    image: '',
  });

  // 获取验证码
  const getCaptcha = async () => {
    try {
      const res = await fetchCaptcha();
      if (res) {
        setCaptchaData({
          key: res.key,
          image: res.image,
        });
      }
    } catch (error) {
      console.error('获取验证码失败:', error);
      toast.error('获取验证码失败');
    }
  };

  // 初始化获取验证码
  useEffect(() => {
    getCaptcha();
  }, []);

  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    captcha: '',
  });

  // 注册表单状态
  const [registerForm, setRegisterForm] = useState({
    email: '',
    userName: '', // 添加用户名字段
    password: '',
    confirmPassword: '',
    captcha: '',
  });

  // 表单错误状态
  const [errors, setErrors] = useState({
    loginEmail: '',
    loginPassword: '',
    loginCaptcha: '',
    registerEmail: '',
    registerUserName: '',
    registerPassword: '',
    registerConfirm: '',
    registerCaptcha: '',
  });

  // 表单提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 登录/注册成功状态
  const [isSuccess, setIsSuccess] = useState(false);

  // 处理 tab 变化
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  // 处理登录表单变化
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let field = '';

    if (id === 'login-email') field = 'email';
    else if (id === 'login-password') field = 'password';
    else if (id === 'login-captcha') field = 'captcha';

    if (field) {
      setLoginForm({
        ...loginForm,
        [field]: value,
      });
    }

    // 清除对应的错误信息
    if (id === 'login-email') {
      setErrors({ ...errors, loginEmail: '' });
    } else if (id === 'login-password') {
      setErrors({ ...errors, loginPassword: '' });
    } else if (id === 'login-captcha') {
      setErrors({ ...errors, loginCaptcha: '' });
    }
  };

  // 处理注册表单变化
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let field = '';

    if (id === 'register-email') field = 'email';
    else if (id === 'register-username') field = 'userName';
    else if (id === 'register-password') field = 'password';
    else if (id === 'register-confirm') field = 'confirmPassword';
    else if (id === 'register-captcha') field = 'captcha';

    if (field) {
      setRegisterForm({
        ...registerForm,
        [field]: value,
      });
    }

    // 清除对应的错误信息
    if (id === 'register-email') {
      setErrors({ ...errors, registerEmail: '' });
    } else if (id === 'register-username') {
      setErrors({ ...errors, registerUserName: '' });
    } else if (id === 'register-password') {
      setErrors({ ...errors, registerPassword: '' });
    } else if (id === 'register-confirm') {
      setErrors({ ...errors, registerConfirm: '' });
    } else if (id === 'register-captcha') {
      setErrors({ ...errors, registerCaptcha: '' });
    }
  };

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // 处理登录提交
  const handleLoginSubmit = async () => {
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

    if (!loginForm.captcha) {
      newErrors.loginCaptcha = '请输入验证码';
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      setIsSubmitting(true);

      try {
        // 加密密码
        const encryptedPassword = await encrypt(loginForm.password);
        if (typeof encryptedPassword === 'boolean' && !encryptedPassword) {
          toast.error('加密错误');
          return;
        }
        // 调用登录API
        const response = await login({
          email: loginForm.email,
          password: encryptedPassword,
          captcha: loginForm.captcha,
          captchaKey: captchaData.key,
        });

        if (response) {
          useUserStore.setState({ token: response.token });
          // 获取用户信息
          const userInfo = await fetchUserInfo(response.userId);

          if (userInfo) {
            // 存储用户信息到store
            loginUser(
              {
                userId: userInfo.userId,
                userName: userInfo.userName,
                email: userInfo.email,
                avatar: userInfo.avatarUrl || '',
              },
              response.token
            );

            setIsSuccess(true);
            toast.success(`欢迎回来，${userInfo.userName}！`);
          }
        }
      } catch (error) {
        console.error('登录失败:', error);
        toast.error('请检查输入的邮箱、密码或验证码');
        getCaptcha(); // 失败后刷新验证码
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 处理注册提交
  const handleRegisterSubmit = async () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!registerForm.email) {
      newErrors.registerEmail = '请输入邮箱地址';
      valid = false;
    } else if (!validateEmail(registerForm.email)) {
      newErrors.registerEmail = '请输入有效的邮箱地址';
      valid = false;
    }

    if (!registerForm.userName) {
      newErrors.registerUserName = '请输入用户名';
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

    if (!registerForm.captcha) {
      newErrors.registerCaptcha = '请输入验证码';
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      setIsSubmitting(true);

      try {
        // 加密密码
        const encryptedPassword = await encrypt(registerForm.password);

        if (typeof encryptedPassword === 'boolean' && !encryptedPassword) {
          toast.error('加密错误');
          return;
        }

        // 调用注册API
        const response = await register({
          userName: registerForm.userName,
          email: registerForm.email,
          password: encryptedPassword,
          captcha: registerForm.captcha,
          captchaKey: captchaData.key,
        });

        if (response) {
          // 存储token到store
          useUserStore.setState({ token: response.token });

          // 获取用户信息
          const userInfo = await fetchUserInfo(response.userId);

          if (userInfo) {
            // 存储用户信息到store
            loginUser(
              {
                userId: userInfo.userId,
                userName: userInfo.userName,
                email: userInfo.email,
                avatar: userInfo.avatarUrl || '',
              },
              response.token
            );

            setIsSuccess(true);
            toast.success(`${userInfo.userName}，欢迎加入！`);
          }
        }
      } catch (error) {
        console.error('注册失败:', error);
        toast.error('注册过程中出现错误，请检查输入或验证码');
        getCaptcha(); // 失败后刷新验证码
      } finally {
        setIsSubmitting(false);
      }
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
        <div className="space-y-2">
          <Label htmlFor="login-captcha">验证码</Label>
          <div className="flex gap-2">
            <Input
              id="login-captcha"
              type="text"
              placeholder="请输入验证码"
              value={loginForm.captcha}
              onChange={handleLoginChange}
              className={cn(errors.loginCaptcha && 'border-danger', 'flex-1')}
            />
            {captchaData.image && (
              <img
                src={
                  captchaData.image.startsWith('data:')
                    ? captchaData.image
                    : `data:image/png;base64,${captchaData.image}`
                }
                alt="验证码"
                className="h-10 cursor-pointer rounded border"
                onClick={getCaptcha}
                title="点击刷新验证码"
              />
            )}
          </div>
          {errors.loginCaptcha && <p className="text-danger text-sm">{errors.loginCaptcha}</p>}
        </div>
        <div className="mt-8 flex items-center justify-between">
          <Button className="pl-0" variant="link">
            忘记密码
          </Button>
          <Button className="px-8" onClick={handleLoginSubmit} disabled={isSubmitting || isSuccess}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
          <Label htmlFor="register-username">用户名</Label>
          <Input
            id="register-username"
            type="text"
            placeholder="请输入用户名"
            value={registerForm.userName}
            onChange={handleRegisterChange}
            className={cn(errors.registerUserName && 'border-danger')}
          />
          {errors.registerUserName && (
            <p className="text-danger text-sm">{errors.registerUserName}</p>
          )}
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
        <div className="space-y-2">
          <Label htmlFor="register-captcha">验证码</Label>
          <div className="flex gap-2">
            <Input
              id="register-captcha"
              type="text"
              placeholder="请输入验证码"
              value={registerForm.captcha}
              onChange={handleRegisterChange}
              className={cn(errors.registerCaptcha && 'border-danger', 'flex-1')}
            />
            {captchaData.image && (
              <img
                src={
                  captchaData.image.startsWith('data:')
                    ? captchaData.image
                    : `data:image/png;base64,${captchaData.image}`
                }
                alt="验证码"
                className="h-10 cursor-pointer rounded border"
                onClick={getCaptcha}
                title="点击刷新验证码"
              />
            )}
          </div>
          {errors.registerCaptcha && (
            <p className="text-danger text-sm">{errors.registerCaptcha}</p>
          )}
        </div>
        <div className="mt-8 flex">
          <Button
            className="w-full"
            onClick={handleRegisterSubmit}
            disabled={isSubmitting || isSuccess}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
