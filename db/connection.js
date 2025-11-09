import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// Configurar el adaptador para leer/escribir en db.json
const adapter = new JSONFile('db/db.json');

// Crear la instancia de la base de datos con estructura inicial
const db = new Low(adapter, { reviews: [] });

// Leer los datos del archivo
await db.read();

export default db;
