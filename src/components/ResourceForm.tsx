import { useEffect,useState } from "react";
import {getAccessToken} from "../services/auth"
type EditableResource = {
    id:string,
    type: string,
    title: string,
    description: string,
    categoryId: string,
    supportedTool: string,
    usageInstructions: string,
}
type Category = {
    id: string,
    name: string,
}
export function ResourceForm({
        resource,
        onSaved,
    }:{
        resource:EditableResource|null;
        onSaved: (message: string) => void;
    }){
        const [submitError, setSubmitError] = useState("");
        const [categories, setCategories] = useState<Category[]>([]);
        const [isSaving,setIsSaving]=useState(false)
        const [fieldErrors, setFieldErrors] =
        useState<Record<string, string[]>>({});
        useEffect(() => {
            const loadCategories = async () => {
                try {
                        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
                        if (!response.ok) {
                            throw new Error("שגיאה בטעינת הקטגוריות");
                        }
                        const categories = await response.json();
                        setCategories(categories.items);
                    } catch (error) {
                        const message = error instanceof Error ? error.message : "שגיאה בטעינת הקטגוריות";
                        alert(message);
                    }
                };
                loadCategories();
            }, []);


        return (
        <div>
            <form 
                className="mb-8 grid grid-cols-2 gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                onReset={() => {
                    setSubmitError("");
                    setFieldErrors({});
                }}
                onSubmit={async (e) => {
                e.preventDefault();
                if(isSaving)return;
                setSubmitError("");
                setFieldErrors({});
                const form=e.currentTarget
                const formData = new FormData(form);
                const token=getAccessToken();
                if(!token){
                    setSubmitError("נדרשת התחברות כמנהל")
                    return;
                }
                const file=formData.get("file")
                const hasFile = file instanceof File && file.size>0;
                if(!resource&&!hasFile){
                    setSubmitError("יש לבחור קובץ שאינו ריק");
                    return;
                }
                if(hasFile&&file.size>1024*1024){
                    setSubmitError("הגודל המירבי הוא 1 MiB");
                    return;
                }
                if(!hasFile){
                    formData.delete("file");
                }
                setIsSaving(true);
                try{
                    const url=resource?`${import.meta.env.VITE_API_URL}/api/admin/resources/${resource.id}`
                    :`${import.meta.env.VITE_API_URL}/api/admin/resources`;
                    const response=await fetch(url,
                        {
                            method:resource?"PATCH":"POST",
                            headers:{
                                Authorization:`Bearer ${token}`,
                            },
                            body:formData,
                        }
                    );
                    if(response.status===401){
                        throw new Error("ההתחברות פגה. יש להתחבר מחדש")
                    }
                    if(response.status===403){
                        throw new Error("נדרשת הרשאת מנהל")
                    }
                    if (!response.ok) {
                        const result = await response.json();
                        if (
                            result.error?.code === "VALIDATION_ERROR" &&
                            result.error?.details
                        ) {
                            setFieldErrors(result.error.details);
                        }
                        throw new Error(
                            result.error?.message ?? "שמירת המשאב נכשלה"
                        );
                    }
                    if (!resource) {
                        form.reset();
                    }

                onSaved(
                resource
                ? "המשאב עודכן בהצלחה"
                : "המשאב נוסף בהצלחה"
                );
                }catch(error){
                    setSubmitError(
                        error instanceof Error?error.message:"שמירת המשאב נכשלה"
                    )
                }
                finally{
                    setIsSaving(false)
                }
            }}>
                {submitError && (
                    <p
                        role="alert"
                        className="col-span-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                    >
                        {submitError}
                    </p>
                )}          
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    בחר סוג משאב
                <select name="type"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    defaultValue={resource?.type??""}
                     required>
                    <option value="">בחר סוג משאב</option>
                    <option value="SKILL">Skill</option>
                    <option value="RULE">Rule</option>
                </select>
                    {fieldErrors.type?.map((message, index) => (
                    <p key={index} className="text-sm text-rose-700">
                        {message}
                    </p>))}
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    כותרת
                <input type="text"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    name="title"
                    placeholder="כותרת"
                    defaultValue={resource?.title??""}
                    required
                    maxLength={100}></input>
                    {fieldErrors.title?.map((message, index) => (
                    <p key={index} className="text-sm text-rose-700">
                        {message}
                    </p>))}
                 </label>   
                 <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 col-span-2">
                    תיאור
                <textarea
                    name="description"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="תיאור-לפחות 10 תווים"
                    rows={4}
                    defaultValue={resource?.description??""}
                    minLength={10}
                    maxLength={500}
                    required></textarea>
                    {fieldErrors.description?.map((message, index) => (
                    <p key={index} className="text-sm text-rose-700">
                        {message}
                    </p>))}
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    תמיכה בכלי
                <input type="text"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    name="supportedTool"
                    placeholder="תמיכה בכלי"
                    defaultValue={resource?.supportedTool??""}
                    required
                    maxLength={100}></input>
                    {fieldErrors.supportedTool?.map((message, index) => (
                    <p key={index} className="text-sm text-rose-700">
                        {message}
                    </p>))}
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 col-span-2">
                    הוראות שימוש
                <textarea
                    name="usageInstructions"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="הוראות שימוש"
                    rows={4}
                    defaultValue={resource?.usageInstructions??""}
                    required
                    maxLength={1000}></textarea>
                    {fieldErrors.usageInstructions?.map((message, index) => (
                    <p key={index} className="text-sm text-rose-700">
                        {message}
                    </p>))}
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    בחר קטגוריה
                <select name="categoryId" 
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    defaultValue={resource?.categoryId??""}
                    required>
                    <option value="">בחר קטגוריה</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                    {fieldErrors.categoryId?.map((message, index) => (
                    <p key={index} className="text-sm text-rose-700">
                        {message}
                    </p>))}
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    בחר קובץ
                <input type="file" name="file"
                 className="block w-full text-sm text-slate-600 file:me-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-semibold file:text-indigo-700"
                 accept=".txt,.json,.md" required={!resource}></input>
                    {fieldErrors.file?.map((message, index) => (
                    <p key={index} className="text-sm text-rose-700">
                        {message}
                    </p>))}
                 </label>
                 <div className="col-span-2 flex gap-3">
                <button type="submit" className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={isSaving}>{isSaving?"שומר...": resource?"שמור שינויים":"צור משאב"}</button>
                {!resource && (
                    <button
                        type="reset"
                        disabled={isSaving}
                        className="rounded-lg border border-slate-300 px-5 py-3 font-medium hover:bg-slate-100 disabled:opacity-50"
                    >
                        נקה טופס
                    </button>
                )}
                </div>
            </form>
        </div>
        )               
}   
