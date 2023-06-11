import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateFileDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}
