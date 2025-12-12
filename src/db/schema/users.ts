import {mysqlTable, serial, timestamp, varchar} from "drizzle-orm/mysql-core";
import {relations} from "drizzle-orm";
import {testsTable} from "@/db/schema/tests";
import {attemptsTable} from "@/db/schema/attempts";
import {accessTable} from "@/db/schema/access";

export const usersTable = mysqlTable('users', {
    id: serial().primaryKey(),
    username: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
    tests: many(testsTable),
    answers: many(attemptsTable),
    access: many(accessTable)
}));