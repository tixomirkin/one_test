import {boolean, mysqlEnum, int, mysqlTable, serial, timestamp, varchar} from "drizzle-orm/mysql-core";
import {relations} from "drizzle-orm";
import {testsTable} from "@/db/schema/tests";
import {optionsTable} from "@/db/schema/options";
import {answersTable} from "@/db/schema/answers";

export const questionTypeEnum = mysqlEnum('question_type_enum', ['single', 'multiple', 'text', "textarea", "date"])

export const questionTable = mysqlTable('question', {
    id: serial("id").primaryKey(),
    testId: int('test_id').notNull(),
    questionText: varchar("question_text", { length: 255 }).notNull(),
    questionType: questionTypeEnum,
    required: boolean('required').default(false).notNull(),
    position: int().default(0).notNull(),
    correctAnswer: varchar("correct_answer", { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const questionRelations = relations(questionTable, ({ one, many }) => ({
    test: one(testsTable, {
        fields: [questionTable.testId],
        references: [testsTable.id],
    }),

    options: many(optionsTable),
    answers: many(answersTable)
}))