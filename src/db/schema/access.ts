import { mysqlEnum, int, mysqlTable, serial, timestamp} from "drizzle-orm/mysql-core";
import {relations} from "drizzle-orm";
import {testsTable} from "@/db/schema/tests";
import {usersTable} from "@/db/schema/users";


const roleEnum = mysqlEnum('role_enum', ['owner', 'editor', 'reader', 'participant'])


export const accessTable = mysqlTable('access', {
    id: serial("id").primaryKey(),
    userId: int('user_id').notNull(),
    testId: int('test_id').notNull(),
    role: roleEnum,
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const answersRelations = relations(accessTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [accessTable.userId],
        references: [usersTable.id],
    }),
    test: one(testsTable, {
        fields: [accessTable.testId],
        references: [testsTable.id],
    })
}))