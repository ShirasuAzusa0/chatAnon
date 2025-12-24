import { useState, type KeyboardEvent } from 'react';
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
import { Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface NewRoleFormData {
  roleName: string;
  description: string;
  attachment?: File | null;
  tags: string[];
  shortInfo: string;
  prompt: string;
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
    description: '',
    attachment: null,
    tags: [],
    shortInfo: '',
    prompt: '',
  });

  // 表单错误状态
  const [errors, setErrors] = useState({
    roleName: '',
    description: '',
    shortInfo: '',
    prompt: '',
    tags: '',
  });

  // 标签输入状态
  const [tagInput, setTagInput] = useState('');

  // 表单提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理表单变化
  const handleInputChange = (
    field: keyof NewRoleFormData,
    value: string | File | null | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 清除对应的错误信息
    const errorKey = field as keyof typeof errors;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: '',
      }));
    }
  };

  // 处理标签输入
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  // 添加标签
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      handleInputChange('tags', [...formData.tags, trimmedTag]);
      setTagInput('');
    }
  };

  // 按下回车添加标签
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange(
      'tags',
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
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

    if (!formData.description.trim()) {
      newErrors.description = '请输入角色特征';
      valid = false;
    } else if (formData.description.trim().length < 10) {
      newErrors.description = '角色特征至少需要10个字符';
      valid = false;
    } else if (formData.description.trim().length > 500) {
      newErrors.description = '角色特征不能超过500个字符';
      valid = false;
    }

    // shortInfo 必填，长度限制
    if (!formData.shortInfo.trim()) {
      newErrors.shortInfo = '请输入角色简介';
      valid = false;
    } else if (formData.shortInfo.trim().length > 120) {
      newErrors.shortInfo = '角色简介不能超过120个字符';
      valid = false;
    }

    // prompt 必填，最小长度
    if (!formData.prompt.trim()) {
      newErrors.prompt = '请输入系统提示词';
      valid = false;
    } else if (formData.prompt.trim().length < 10) {
      newErrors.prompt = '系统提示词至少需要10个字符';
      valid = false;
    }

    // tags 必填，至少一个标签
    if (!formData.tags || formData.tags.length === 0) {
      newErrors.tags = '请至少添加一个标签';
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
        description: '',
        attachment: null,
        tags: [],
        shortInfo: '',
        prompt: '',
      });
      setErrors({
        roleName: '',
        description: '',
        shortInfo: '',
        prompt: '',
        tags: '',
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
          description: '',
          attachment: null,
          tags: [],
          shortInfo: '',
          prompt: '',
        });
        setErrors({
          roleName: '',
          description: '',
          shortInfo: '',
          prompt: '',
          tags: '',
        });
        setTagInput('');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-200">
        <DialogHeader>
          <DialogTitle>创建新角色</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 左列 */}
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
              {errors.roleName && <p className="text-destructive text-sm">{errors.roleName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="tags"
                  type="text"
                  placeholder="输入标签后按回车添加"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagKeyDown}
                  className={cn(errors.tags && 'border-destructive')}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || isSubmitting}
                >
                  添加
                </Button>
              </div>
              {errors.tags && <p className="text-destructive mt-1 text-sm">{errors.tags}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-2 py-1">
                    {tag}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground ml-1"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">添加标签以便更好地分类和查找角色</p>
            </div>

            <div className="space-y-2">
              <Label>角色图片</Label>
              <FileUpload
                maxSize={5}
                onFileSelect={(file) => handleInputChange('attachment', file)}
                preview={true}
                placeholder="选择角色图片或直接拖拽到此处"
                disabled={isSubmitting}
              />
              <p className="text-muted-foreground text-xs">
                支持 JPG、PNG、GIF 格式，建议尺寸 200x200 像素，文件大小不超过 5MB
              </p>
            </div>
          </div>

          {/* 右列 */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="short-info">角色简介</Label>
              <Input
                id="short-info"
                type="text"
                placeholder="请输入角色的简短介绍"
                value={formData.shortInfo}
                onChange={(e) => handleInputChange('shortInfo', e.target.value)}
                className={cn(errors.shortInfo && 'border-destructive')}
                disabled={isSubmitting}
              />
              {errors.shortInfo && <p className="text-destructive text-sm">{errors.shortInfo}</p>}
              <p className="text-muted-foreground text-xs">简短的角色介绍，便于快速了解</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">系统提示词</Label>
              <Textarea
                id="prompt"
                placeholder="请输入系统提示词，用于指导 AI 角色的行为和回复风格..."
                value={formData.prompt}
                onChange={(e) => handleInputChange('prompt', e.target.value)}
                className={cn('max-h-50 min-h-32', errors.prompt && 'border-destructive')}
                disabled={isSubmitting}
              />
              {errors.prompt && <p className="text-destructive text-sm">{errors.prompt}</p>}
              <p className="text-muted-foreground text-xs">
                系统提示词将影响 AI 角色的对话风格和行为表现
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">角色特征</Label>
              <Textarea
                id="description"
                placeholder="请详细描述角色的特征、性格、背景等信息..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={cn(errors.description && 'border-destructive', 'min-h-32', 'max-h-50')}
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between">
                {errors.description && (
                  <p className="text-destructive text-sm">{errors.description}</p>
                )}
                <p className="text-muted-foreground ml-auto text-sm">
                  {formData.description.length}/500
                </p>
              </div>
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
