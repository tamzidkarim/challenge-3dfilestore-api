import { App } from '@/app';
import { FileRoute } from '@routes/files.route';
import { ValidateEnv } from '@utils/validateEnv';

ValidateEnv();

const app = new App([new FileRoute()]);

app.listen();
