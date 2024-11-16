// apps/backend/src/dtos/submission.dto.ts
import { IsString, IsNumber, IsDate, IsOptional, Min } from 'class-validator';

export class SubmissionDto {
  @IsString()
  public name!: string;

  @IsString()
  public description!: string;

  @IsNumber()
  @Min(0)
  public quantity!: number;

  @IsString()
  public location!: string;

  @IsDate()
  public expiryDate!: Date;

  @IsDate()
  public productionDate!: Date;

  @IsString()
  public category!: string;

  @IsNumber()
  @Min(0)
  public price!: number;

  @IsString()
  @IsOptional()
  public imageUri?: string;

  @IsOptional()
  public metadata?: Record<string, any>;
}
