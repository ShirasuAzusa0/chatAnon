import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface NewRoleFormData {
  roleName: string;
  characteristics: string;
  avatar?: File | null;
}

interface NewRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: NewRoleFormData) => Promise<void> | void;
}

export default function NewRoleDialog({ open, onOpenChange, onSubmit }: NewRoleDialogProps) {
  // 表单状态
  const [formData, setFormData] = useState<NewRoleFormData>({
    roleName: '',
    characteristics: '',
    avatar: null,
  });

  // 表单错误状态
  const [errors, setErrors] = useState({
    roleName: '',
    characteristics: '',
  });

  // 表单提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理表单变化
  const handleInputChange = (field: keyof NewRoleFormData, value: string | File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 清除对应的错误信息
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // 验证表单
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.roleName.trim()) {
      newErrors.roleName = '请输入角色名称';
      valid = false;
    } else if (formData.roleName.trim().length < 2) {
      newErrors.roleName = '角色名称至少需要2个字符';
      valid = false;
    } else if (formData.roleName.trim().length > 20) {
      newErrors.roleName = '角色名称不能超过20个字符';
      valid = false;
    }

    if (!formData.characteristics.trim()) {
      newErrors.characteristics = '请输入角色特征';
      valid = false;
    } else if (formData.characteristics.trim().length < 10) {
      newErrors.characteristics = '角色特征至少需要10个字符';
      valid = false;
    } else if (formData.characteristics.trim().length > 500) {
      newErrors.characteristics = '角色特征不能超过500个字符';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // 处理表单提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      // 提交成功后重置表单
      setFormData({
        roleName: '',
        characteristics: '',
        avatar: null,
      });
      setErrors({
        roleName: '',
        characteristics: '',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('提交角色失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理对话框关闭
  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      // 如果关闭对话框，重置表单
      if (!newOpen) {
        setFormData({
          roleName: '',
          characteristics: '',
          avatar: null,
        });
        setErrors({
          roleName: '',
          characteristics: '',
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>创建新角色</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role-name">角色名称</Label>
            <Input
              id="role-name"
              type="text"
              placeholder="请输入角色名称"
              value={formData.roleName}
              onChange={(e) => handleInputChange('roleName', e.target.value)}
              className={cn(errors.roleName && 'border-destructive')}
              disabled={isSubmitting}
            />
            {errors.roleName && <p className="text-sm text-destructive">{errors.roleName}</p>}
          </div>

          <div className="space-y-2">
            <Label>角色图片</Label>
            <FileUpload
              maxSize={5}
              onFileSelect={(file) => handleInputChange('avatar', file)}
              preview={true}
              placeholder="选择角色图片或直接拖拽到此处"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              支持 JPG、PNG、GIF 格式，建议尺寸 200x200 像素，文件大小不超过 5MB
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="characteristics">角色特征</Label>
            <Textarea
              id="characteristics"
              placeholder="请详细描述角色的特征、性格、背景等信息..."
              value={formData.characteristics}
              onChange={(e) => handleInputChange('characteristics', e.target.value)}
              className={cn(
                errors.characteristics && 'border-destructive',
                'min-h-[120px]',
                'max-h-[200px]'
              )}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              {errors.characteristics && (
                <p className="text-sm text-destructive">{errors.characteristics}</p>
              )}
              <p className="text-sm text-muted-foreground ml-auto">
                {formData.characteristics.length}/500
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? '创建中...' : '创建角色'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
