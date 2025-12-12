import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@/db/schema"
import { APP_CONFIG } from "@/lib/config";

const connection = await mysql.createConnection({
    host: APP_CONFIG.db.host,
    user: APP_CONFIG.db.user,
    password: APP_CONFIG.db.password,
    database: APP_CONFIG.db.database,
    port: APP_CONFIG.db.port,
});

export const db = drizzle({ client: connection, mode: 'default', schema });
// or if you need client connection
// async function main() {
//     const connection = await mysql.createConnection({
//         host: "host",
//         user: "user",
//         database: "database",
//     });
//     const db = drizzle({ client: connection });
// }
// main();