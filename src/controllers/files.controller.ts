import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { File } from '@/interfaces/files.interface';
import { FileService } from '@/services/files.service';
import fs from 'fs';
import readline from 'readline';

export class FileController {
  public user = Container.get(FileService);

  public getFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllFilesData: File[] = await this.user.findAllFile();

      res.status(200).json(findAllFilesData);
    } catch (error) {
      next(error);
    }
  };
  public getFileById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const { download } = req.query;
      const findFileData: File = await this.user.findFileById(id);
      if (download) {
        res.download(`${this.user.filePath}/${id}`, findFileData.name, (err: Error) => {
          if (err) {
            next(err);
          }
        });
        return;
      }
      res.status(200).json(findFileData);
    } catch (error) {
      next(error);
    }
  };

  public transformFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      await this.user.findFileById(id);
      const { x, y, z } = JSON.parse(req.query.vector as string);
      const inputFile = `${this.user.filePath}/${id}`;
      const outputFile = `${this.user.filePath}/temp-${id}`;

      const MEMORY_LIMIT = 100 * 1024 * 1024; // 100MB memory limit
      const readableStream = fs.createReadStream(inputFile);

      const writableStream = fs.createWriteStream(outputFile);

      writableStream.setMaxListeners(25);

      let currentMemoryUsage = process.memoryUsage().heapUsed;

      const isMemoryUsageExceeded = () => {
        const { heapUsed } = process.memoryUsage();
        const diff = heapUsed - currentMemoryUsage;
        currentMemoryUsage = heapUsed;
        return heapUsed > MEMORY_LIMIT || diff > MEMORY_LIMIT / 2;
      };

      const rl = readline.createInterface({
        input: readableStream,
        // output: writableStream,
        crlfDelay: Infinity,
      });

      rl.on('line', line => {
        if (isMemoryUsageExceeded()) {
          rl.pause();

          const resumeHandler = () => {
            rl.resume();
            writableStream.removeListener('drain', resumeHandler);
          };
          writableStream.once('drain', resumeHandler);
        }
        if (line[0] === 'v' && line[1] != 'n') {
          const vertexCoords = line.replace(/\s+/g, ' ').trim().split(' ');
          const scaledVertexCoords = `${vertexCoords[0]}  ${parseFloat(vertexCoords[1]) * x}  ${parseFloat(vertexCoords[2]) * y}  ${
            parseFloat(vertexCoords[3]) * z
          }`;
          const canWriteMore = writableStream.write(`${scaledVertexCoords}\n`);
          if (!canWriteMore) {
            rl.pause();

            const resumeHandler = () => {
              rl.resume();
              writableStream.removeListener('drain', resumeHandler);
            };
            writableStream.once('drain', resumeHandler);
          }
        } else {
          const canWriteMore = writableStream.write(`${line}\n`);
          if (!canWriteMore) {
            rl.pause();

            const resumeHandler = () => {
              rl.resume();
              writableStream.removeListener('drain', resumeHandler);
            };
            writableStream.once('drain', resumeHandler);
          }
        }
      });

      // Handle errors
      readableStream.on('error', err => {
        console.error('Error reading the input file:', err);
      });

      writableStream.on('error', err => {
        console.error('Error writing to the output file:', err);
      });

      writableStream.on('finish', () => {
        console.log('Data processing and writing completed successfully.');
      });

      rl.on('close', () => {
        console.log('Finished reading file');
        writableStream.end();
        res.download(outputFile, err => {
          if (err) {
            res.send({
              error: err,
              msg: 'Problem downloading the file',
            });
          } else {
            fs.unlinkSync(outputFile);
          }
        });
        // res.send('ok');
      });
    } catch (error) {
      next(error);
    }
  };

  public uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file as Express.Multer.File;
      const newFileData: File = await this.user.uploadFile(file);

      res.status(201).json(newFileData);
    } catch (error) {
      next(error);
    }
  };

  public renameFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const data = req.body;
      const updateFileData: File = await this.user.renameFile(id, data);

      res.status(200).json(updateFileData);
    } catch (error) {
      next(error);
    }
  };

  public deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      await this.user.deleteFile(id);

      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };
}
