import { boolean, int, mysqlTable, serial, timestamp, varchar} from "drizzle-orm/mysql-core";
import {relations} from "drizzle-orm";
import {questionTable} from "@/db/schema/questions";
import {answersTable} from "@/db/schema/answers";


export const optionsTable = mysqlTable('options', {
    id: serial("id").primaryKey(),
    questionId: int('question_id'),
    optionText: varchar("option_text", { length: 255 }).notNull(),
    position: int().default(0).notNull(),
    isCorrect: boolean('is_correct').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const optionsRelations = relations(optionsTable, ({ one, many }) => ({
    question: one(questionTable, {
        fields: [optionsTable.questionId],
        references: [questionTable.id],
    }),

    answers: many(answersTable)
}))