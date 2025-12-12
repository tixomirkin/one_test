import {boolean, mysqlEnum, int, mysqlTable, serial, timestamp, varchar} from "drizzle-orm/mysql-core";
import {relations} from "drizzle-orm";
import {attemptsTable} from "@/db/schema/attempts";
import {questionTable} from "@/db/schema/questions";
import {optionsTable} from "@/db/schema/options";


export const answersTable = mysqlTable('answers', {
    id: serial("id").primaryKey(),
    attemptId: int('attempt_id').notNull(),
    questionId: int('question_id').notNull(),
    optionId: int('option_id'),
    textAnswer: varchar("text_answer", {length: 255}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const answersRelations = relations(answersTable, ({ one, many }) => ({
    attempt: one(attemptsTable, {
        fields: [answersTable.attemptId],
        references: [attemptsTable.id],
    }),
    question: one(questionTable, {
        fields: [answersTable.questionId],
        references: [questionTable.id],
    }),
    option: one(optionsTable, {
        fields: [answersTable.optionId],
        references: [optionsTable.id],
    })
}))