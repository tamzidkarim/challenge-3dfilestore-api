import { Service } from 'typedi';
import { HttpException } from '@exceptions/httpException';
import { File } from '@/interfaces/files.interface';
import { db } from '@/models/files.model';
import path from 'path';
import fs from 'fs';

@Service()
export class FileService {
  public filePath = path.resolve(__dirname, '../../uploads');
  public async findAllFile(): Promise<File[]> {
    const files: File[] = db.files;
    return files;
  }

  public async findFileById(id: string): Promise<File> {
    const findFile: File = db.files.find(file => file.id === id);
    if (!findFile) throw new HttpException(404, "File doesn't exist");

    return findFile;
  }

  public async uploadFile(fileData: Express.Multer.File): Promise<File> {
    if (!fileData) {
      throw new HttpException(400, 'Please upload a file');
    }
    const newFile: File = {
      id: fileData.filename,
      name: fileData.originalname,
      creation_date: new Date(),
      size: fileData.size,
    };
    db.files.push(newFile);
    return newFile;
  }

  public async renameFile(id: string, data: File): Promise<File> {
    const findFile: File = db.files.find(file => file.id === id);
    if (!findFile) throw new HttpException(404, "File doesn't exist");

    findFile.name = data.name || findFile.name;

    return findFile;
  }

  public async deleteFile(id: string): Promise<void> {
    const findFile: File = db.files.find(file => file.id === id);
    if (!findFile) throw new HttpException(404, "File doesn't exist");

    db.files = db.files.filter(file => file.id !== findFile.id);
    fs.unlinkSync(`${this.filePath}/${id}`);
  }
}
