import { int, mysqlTable, timestamp, boolean, serial, varchar } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import {usersTable} from "@/db/schema/users";
import {accessTable} from "@/db/schema/access";
import {questionTable} from "@/db/schema/questions";

export const testsTable = mysqlTable('tests', {
    id: serial().primaryKey(),
    ownerId: int('owner_id'),
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
    isTest: boolean('is_test').default(false).notNull(),
    isPublic: boolean('is_public').default(false).notNull(),
    slug: varchar({ length: 255 }).notNull().unique(),
    successMessage: varchar({ length: 1000 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const testsRelations = relations(testsTable, ({ one, many }) => ({
    owner: one(usersTable, {
        fields: [testsTable.ownerId],
        references: [usersTable.id],
    }),
    access: many(accessTable),
    question: many(questionTable)
}))