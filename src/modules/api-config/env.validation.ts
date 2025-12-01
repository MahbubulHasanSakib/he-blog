import { plainToInstance } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsString()
  MONGODB_URI: string;

  @IsNumber()
  PORT: number;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRE: string;

  @IsString()
  AZURE_STORAGE_CONNECTION_STRING: string;

  @IsString()
  AZURE_STORAGE_CONTAINER: string;

  @IsString()
  AZURE_ACCOUNT_KEY: string;

  @IsString()
  BASE_PATH: string;

  @IsString()
  DOCS_USERNAME: string;

  @IsString()
  DOCS_PASSWORD: string;

  @IsString()
  EMAIL_HOST: string;

  @IsString()
  EMAIL_USER: string;

  @IsString()
  EMAIL_PASS: string;

  @IsNumber()
  @IsOptional()
  EMAIL_PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
