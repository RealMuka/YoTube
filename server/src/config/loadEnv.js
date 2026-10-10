import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../../..');
dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config({ path: path.resolve(currentDir, '../../.env') });
