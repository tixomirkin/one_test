import {int, mysqlTable, serial, timestamp} from "drizzle-orm/mysql-core";
import {relations} from "drizzle-orm";
import {testsTable} from "@/db/schema/tests";
import {usersTable} from "@/db/schema/users";
import {answersTable} from "@/db/schema/answers";


export const attemptsTable = mysqlTable('attempts', {
    id: serial().primaryKey(),
    testId: int('test_id').notNull(),
    userId: int('user_id'),
    // startedAt: timestamp('started_at'),
    // finishedAt: timestamp('finished_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const attemptsRelations = relations(attemptsTable, ({ one, many }) => ({
    test: one(testsTable, {
        fields: [attemptsTable.testId],
        references: [testsTable.id],
    }),
    user: one(usersTable, {
        fields: [attemptsTable.userId],
        references: [usersTable.id],
    }),

    answers: many(answersTable)
}))