import { Router } from 'express';
import { FileController } from '@controllers/files.controller';
import { UpdateFileDto } from '@/dtos/files.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { upload } from '@/utils/fileLib';

export class FileRoute implements Routes {
  public path = '/files';
  public router = Router();
  public file = new FileController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.file.getFiles);
    this.router.get(`${this.path}/transform/:id`, this.file.transformFile);
    this.router.get(`${this.path}/:id`, this.file.getFileById);
    this.router.post(`${this.path}`, upload.single('file'), this.file.uploadFile);
    this.router.put(`${this.path}/:id`, this.file.renameFile);
    this.router.delete(`${this.path}/:id`, this.file.deleteFile);
  }
}
