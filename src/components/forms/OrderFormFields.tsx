import React from 'react';
import { Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormFieldProps } from '@/types/common';
import { ORDER_TYPE_OPTIONS } from '@/lib/validation-schemas';
import { useCities, useEquipmentTypes, useRKs } from '@/hooks/useStaticData';

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

export function EquipmentTypeSelect({ control, errors, className }: FormFieldProps) {
  const { data: equipmentTypes = [] } = useEquipmentTypes();
  return (
    <div className={className}>
      <Label htmlFor="equipmentTypeId">Тип техники *</Label>
      <Controller
        name="equipmentTypeId"
        control={control}
        render={({ field }) => (
          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? field.value.toString() : ''}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип техники" />
            </SelectTrigger>
            <SelectContent>
              {equipmentTypes.map((et: { id: number; name: string }) => (
                <SelectItem key={et.id} value={et.id.toString()}>
                  {et.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors.equipmentTypeId && (
        <p className="text-sm text-destructive mt-1">{errors.equipmentTypeId.message}</p>
      )}
    </div>
  );
}

export function RkSelect({ control, errors, className }: FormFieldProps) {
  const { data: availableRKs = [] } = useRKs();
  return (
    <div className={className}>
      <Label htmlFor="rkId">РК *</Label>
      <Controller
        name="rkId"
        control={control}
        render={({ field }) => (
          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? field.value.toString() : ''}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите РК" />
            </SelectTrigger>
            <SelectContent>
              {availableRKs.map((rk: { id: number; name: string }) => (
                <SelectItem key={rk.id} value={rk.id.toString()}>
                  {rk.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors.rkId && (
        <p className="text-sm text-destructive mt-1">{errors.rkId.message}</p>
      )}
    </div>
  );
}

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

export function CommentTextarea({ register, errors, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor="comment">Комментарий</Label>
      <Textarea
        id="comment"
        {...register('comment')}
        placeholder="Комментарий к заказу"
        rows={4}
      />
    </div>
  );
}

export function CitySelect({ control, errors, className }: FormFieldProps) {
  const { data: availableCities = [] } = useCities();
  return (
    <div className={className}>
      <Label htmlFor="cityId">Город *</Label>
      <Controller
        name="cityId"
        control={control}
        render={({ field }) => (
          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? field.value.toString() : ''}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите город" />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city: { id: number; name: string }) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors.cityId && (
        <p className="text-sm text-destructive mt-1">{errors.cityId.message}</p>
      )}
    </div>
  );
}
