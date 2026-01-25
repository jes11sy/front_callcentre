import { useForm } from 'react-hook-form';
// zodResolver removed - not used
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Loader2, 
  MessageSquare, 
  Shield, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { AvitoFormData } from '@/types/avito';

// Zod schema for validation (used by parent component)
export const avitoSchema = z.object({
  name: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  clientId: z.string().min(1, 'Client ID обязателен'),
  clientSecret: z.string().min(1, 'Client Secret обязателен'),
  userId: z.string().optional(),
  proxyType: z.enum(['http', 'socks4', 'socks5']).optional(),
  proxyHost: z.string().optional(),
  proxyPort: z.string().optional(),
  proxyLogin: z.string().optional(),
  proxyPassword: z.string().optional(),
});

interface AvitoAccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AvitoFormData) => Promise<boolean>;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  form: ReturnType<typeof useForm<AvitoFormData>>;
  showClientSecret: boolean;
  onToggleClientSecret: () => void;
  showProxyPassword: boolean;
  onToggleProxyPassword: () => void;
  onTestProxy?: (data: AvitoFormData) => void;
  testingProxy?: boolean;
}

export const AvitoAccountForm = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  mode,
  form,
  showClientSecret,
  onToggleClientSecret,
  showProxyPassword,
  onToggleProxyPassword,
  onTestProxy,
  testingProxy = false,
}: AvitoAccountFormProps) => {
  const handleSubmit = async (data: AvitoFormData) => {
    const success = await onSubmit(data);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold flex items-center">
            <MessageSquare className="mr-3 h-5 w-5 text-primary" />
            {mode === 'create' ? 'Добавить аккаунт Avito' : 'Редактировать аккаунт'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'create' 
              ? 'Добавьте новый аккаунт Avito с настройками API и прокси'
              : 'Измените настройки аккаунта Avito и прокси'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
          {/* API настройки */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground border-b pb-2">API настройки</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Название аккаунта <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="name" 
                {...form.register('name')} 
                placeholder="Мой аккаунт Avito"
                className="h-10"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId" className="text-sm font-medium">
                  Client ID <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="clientId" 
                  {...form.register('clientId')} 
                  placeholder="client_id"
                  className="h-10 font-mono"
                />
                {form.formState.errors.clientId && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.clientId.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientSecret" className="text-sm font-medium">
                  Client Secret <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input 
                    id="clientSecret" 
                    type={showClientSecret ? "text" : "password"}
                    {...form.register('clientSecret')} 
                    placeholder="client_secret"
                    className="h-10 pr-10 font-mono"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-10 px-3"
                    onClick={onToggleClientSecret}
                  >
                    {showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {form.formState.errors.clientSecret && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.clientSecret.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId" className="text-sm font-medium">
                ID Профиля
              </Label>
              <Input 
                id="userId" 
                {...form.register('userId')} 
                placeholder="12345"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Необязательное поле. ID пользователя Avito для связи с профилем
              </p>
              {form.formState.errors.userId && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.userId.message}</p>
              )}
            </div>
          </div>

          {/* Настройки прокси */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground border-b pb-2 flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Настройки прокси (опционально)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proxyType" className="text-sm font-medium">Тип прокси</Label>
                <Select onValueChange={(value) => form.setValue('proxyType', value as 'http' | 'socks4' | 'socks5')}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Выберите тип прокси" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="socks4">SOCKS4</SelectItem>
                    <SelectItem value="socks5">SOCKS5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proxyHost" className="text-sm font-medium">Хост</Label>
                <Input 
                  id="proxyHost" 
                  {...form.register('proxyHost')} 
                  placeholder="proxy.example.com"
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proxyPort" className="text-sm font-medium">Порт</Label>
                <Input 
                  id="proxyPort" 
                  {...form.register('proxyPort')} 
                  placeholder="8080"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proxyLogin" className="text-sm font-medium">Логин</Label>
                <Input 
                  id="proxyLogin" 
                  {...form.register('proxyLogin')} 
                  placeholder="proxy_user"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proxyPassword" className="text-sm font-medium">Пароль</Label>
                <div className="relative">
                  <Input 
                    id="proxyPassword" 
                    type={showProxyPassword ? "text" : "password"}
                    {...form.register('proxyPassword')} 
                    placeholder="proxy_pass"
                    className="h-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-10 px-3"
                    onClick={onToggleProxyPassword}
                  >
                    {showProxyPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Кнопка проверки прокси для режима редактирования */}
            {mode === 'edit' && onTestProxy && (
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onTestProxy(form.getValues())}
                  disabled={testingProxy}
                  className="flex items-center gap-2"
                >
                  {testingProxy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Проверка прокси...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Проверить прокси
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Добавление...' : 'Сохранение...'}
                </>
              ) : (
                <>
                  {mode === 'create' ? (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Добавить аккаунт
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Сохранить изменения
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
