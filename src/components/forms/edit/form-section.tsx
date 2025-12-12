

import {fullFormType} from "@/db/forms/get-full-form";
import QuestionSection from "@/components/forms/edit/question-section";
import AddQuestionBtn from "@/components/forms/edit/add-question-btn";
import {Button} from "@/components/ui/button";
import EditFromDialog from "@/components/forms/edit/editFromDialog";
import ManageAccessDialog from "@/components/forms/edit/manage-access-dialog";
import {canManageAccess} from "@/lib/form-access";

export default async function FormsSection({form} : {form: fullFormType}) {
    const canManage = await canManageAccess(form.id);

    return (
        <div className='p-5 flex flex-col gap-3 items-center'>
            <div className='flex flex-row w-full justify-between items-center'>
                <div>
                    <h1 className='text-xl font-bold'>{form.title}</h1>
                    <h2>{form.description}</h2>
                    Ссылка на форму <a className='underline' href={`/form/${form.slug}`}>/form/{form.slug}</a>
                </div>

                <div className="flex gap-2">
                    {canManage && <ManageAccessDialog formId={form.id} />}
                    <EditFromDialog oldForm={form} />
                </div>
            </div>

            {form.question.map((q) => (
                <QuestionSection key={q.id} lastPosition={form.question.length-1} q={q}/>
            ))}
            <AddQuestionBtn formId={form.id}/>
        </div>
    )
}