// Переиспользуемые поля формы для заказов - устраняет дублирование кода
import React from 'react';
import { Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormFieldProps } from '@/types/common';
import { ORDER_TYPE_OPTIONS, EQUIPMENT_TYPE_OPTIONS, RK_OPTIONS } from '@/lib/validation-schemas';

// Поле выбора типа заказа
export function OrderTypeSelect({ control, errors, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor="typeOrder">Тип заявки *</Label>
      <Controller
        name="typeOrder"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип заявки" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors.typeOrder && (
        <p className="text-sm text-destructive mt-1">{errors.typeOrder.message}</p>
      )}
    </div>
  );
}

// Поле выбора типа техники
export function EquipmentTypeSelect({ control, errors, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor="typeEquipment">Тип техники *</Label>
      <Controller
        name="typeEquipment"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип техники" />
            </SelectTrigger>
            <SelectContent>
              {EQUIPMENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors.typeEquipment && (
        <p className="text-sm text-destructive mt-1">{errors.typeEquipment.message}</p>
      )}
    </div>
  );
}

// Поле выбора РК
export function RkSelect({ control, errors, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor="rk">РК *</Label>
      <Controller
        name="rk"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите РК" />
            </SelectTrigger>
            <SelectContent>
              {RK_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors.rk && (
        <p className="text-sm text-destructive mt-1">{errors.rk.message}</p>
      )}
    </div>
  );
}

// Поле имени клиента
export function ClientNameInput({ register, errors, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor="clientName">Имя клиента *</Label>
      <Input
        id="clientName"
        {...register('clientName')}
        placeholder="Введите имя клиента"
      />
      {errors.clientName && (
        <p className="text-sm text-destructive mt-1">{errors.clientName.message}</p>
      )}
    </div>
  );
}

// Поле телефона
export function PhoneInput({ register, errors, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor="phone">Номер телефона *</Label>
      <Input
        id="phone"
        type="tel"
        {...register('phone')}
        placeholder="Введите номер телефона"
      />
      {errors.phone && (
        <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
      )}
    </div>
  );
}

// Поле адреса
export function AddressInput({ register, errors, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor="address">Адрес *</Label>
      <Input
        id="address"
        {...register('address')}
        placeholder="Введите адрес"
      />
      {errors.address && (
        <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
      )}
    </div>
  );
}

// Поле даты встречи
export function DateMeetingInput({ register, errors, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor="dateMeeting">Дата встречи *</Label>
      <Input
        id="dateMeeting"
        type="datetime-local"
        {...register('dateMeeting')}
      />
      {errors.dateMeeting && (
        <p className="text-sm text-destructive mt-1">{errors.dateMeeting.message}</p>
      )}
    </div>
  );
}

// Поле описания проблемы
export function ProblemTextarea({ register, errors, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor="problem">Описание проблемы *</Label>
      <Textarea
        id="problem"
        {...register('problem')}
        placeholder="Опишите проблему"
        rows={4}
      />
      {errors.problem && (
        <p className="text-sm text-destructive mt-1">{errors.problem.message}</p>
      )}
    </div>
  );
}

// Поле города
export function CityInput({ register, errors, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor="city">Город *</Label>
      <Input
        id="city"
        {...register('city')}
        placeholder="Введите город"
      />
      {errors.city && (
        <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
      )}
    </div>
  );
}

// Поле имени Авито аккаунта
export function AvitoNameInput({ register, errors, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor="avitoName">Имя Авито аккаунта</Label>
      <Input
        id="avitoName"
        {...register('avitoName')}
        placeholder="Введите имя Авито аккаунта"
      />
      {errors.avitoName && (
        <p className="text-sm text-destructive mt-1">{errors.avitoName.message}</p>
      )}
    </div>
  );
}

// Поле РК (текстовое)
export function RkInput({ register, errors, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor="rk">РК *</Label>
      <Input
        id="rk"
        {...register('rk')}
        placeholder="Введите РК"
      />
      {errors.rk && (
        <p className="text-sm text-destructive mt-1">{errors.rk.message}</p>
      )}
    </div>
  );
}
