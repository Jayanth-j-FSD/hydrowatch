import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsArray, IsBoolean, IsOptional } from 'class-validator';

export enum AlertType {
  RIVER = 'river',
  DAM = 'dam',
  GROUNDWATER = 'groundwater',
  RAINFALL = 'rainfall',
}

export enum ThresholdOperator {
  GT = 'gt',
  LT = 'lt',
  EQ = 'eq',
}

export enum NotificationChannel {
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push',
}

export class CreateAlertConfigDto {
  @ApiProperty({ enum: AlertType })
  @IsEnum(AlertType)
  type: AlertType;

  @ApiProperty()
  @IsString()
  entityId: string;

  @ApiProperty({ enum: ThresholdOperator })
  @IsEnum(ThresholdOperator)
  thresholdOperator: ThresholdOperator;

  @ApiProperty()
  @IsNumber()
  thresholdValue: number;

  @ApiProperty({ type: [String], enum: NotificationChannel })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateAlertConfigDto {
  @ApiProperty({ required: false, enum: ThresholdOperator })
  @IsOptional()
  @IsEnum(ThresholdOperator)
  thresholdOperator?: ThresholdOperator;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  thresholdValue?: number;

  @ApiProperty({ required: false, type: [String], enum: NotificationChannel })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels?: NotificationChannel[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

