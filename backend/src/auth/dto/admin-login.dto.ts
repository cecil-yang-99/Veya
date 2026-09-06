import { IsString, MaxLength, MinLength } from 'class-validator';

/** Request body for administrator console login. */
export class AdminLoginDto {
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
