import path from 'path';
import multer from 'multer';

const filePath = path.resolve(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, filePath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '.obj');
  },
});

export const upload = multer({ storage });
