import {z} from "zod"
import {useNavigate} from "react-router-dom"
import { saveAccessToken } from "../services/auth";
import { useState } from "react";
export const registerSchema=z.object({
    displayName:z.string().min(3,"שם המשתמש חייב להכיל לפחות 3 תווים"),
    email:z.string().email("כתובת המייל אינה תקינה"),
    password:z.string()
    .min(10,"סיסמה חייבת להכיל לפחות 10 תווים")
    .regex(/[A-Z]/,"סיסמה חייבת להכיל לפחות אות גדולה אחת")
    .regex(/[a-z]/,"סיסמה חייבת להכיל לפחות אות קטנה אחת")
    .regex(/[0-9]/,"סיסמה חייבת להכיל לפחות ספרה אחת")
});
export type registerFormData=z.infer<typeof registerSchema>


import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
export function RegisterForm({
    onAuthSuccess,
    }:{
        onAuthSuccess:()=>void;
    }){
    const{
        register,
        handleSubmit,
        reset,
        formState:{errors, isSubmitting, isValid},
    }=useForm<registerFormData>({
        resolver:zodResolver(registerSchema),
        mode:"onChange",
        defaultValues:{
            displayName:"",
            email:"",
            password:"",
        },
    });
    const navigate=useNavigate();
    const [submitError, setSubmitError] = useState("");
    const onSubmit=async(data:registerFormData)=>{
        setSubmitError("");
        try{
            const response=await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    displayName:data.displayName,
                    email:data.email,
                    password:data.password,
                }),
            
            
            });
            const result:{
                accessToken?:string;
                error?:{message?:string};
            }=await response.json();
            if(!response.ok){
                throw new Error(result.error?.message??"שגיאה ברישום");
            }

            if(
                typeof result.accessToken!=="string"||
                result.accessToken.length===0
            ){
                throw new Error("לא התקבל אסימון גישה תקין מהשרת");
            }
            saveAccessToken(result.accessToken);
            reset();
            onAuthSuccess();
            navigate("/",{replace:true});
        }catch(error){
            const message=error instanceof Error?error.message:"שגיאה ברישום";
            setSubmitError(message);        }
    };
    return(
        <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
            <h1 className="text-2xl font-bold text-slate-900">
             יצירת חשבון 
            </h1>
            <div>
                <label
                htmlFor="login-userName"
                className="mb-2 block text-sm font-medium text-slate-700"
                >
                 שם משתמש
                </label>
                <input{...register("displayName")}placeholder="שם משתמש" className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" id="login-userName"/>
                {errors.displayName&&<p style={{color:"red",margin:0}}>{errors.displayName.message}</p>}
            </div>
            <div>
                <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-medium text-slate-700"
                >
                 כתובת דוא״ל
                </label>
                <input
                id="login-email"
                dir="ltr"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="email"{...register("email")}placeholder="אימייל"/>
                {errors.email&&<p style={{color:"red",margin:0}}>{errors.email.message}</p>}
            </div>
            <div>
                <label
                 htmlFor="login-password"
                 className="mb-2 block text-sm font-medium text-slate-700"
                >               
                 סיסמה
                </label>
                <input 
                id="login-password"
                dir="ltr"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="password"{...register("password")}placeholder="סיסמה"/>
                {errors.password&&<p style={{color:"red",margin:0}}>{errors.password.message}</p>}
                <p className="mt-2 text-sm leading-6 text-slate-500">
                 לפחות 10 תווים, כולל אות גדולה באנגלית,
                 אות קטנה באנגלית וספרה.
                </p>
            </div>
            {submitError && (
              <p
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
              >
                  {submitError}
              </p>
            )}          
            <button 
            className="rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={!isValid||isSubmitting}>
                {isSubmitting?"יוצר חשבון...":"יצירת חשבון"}
            </button>
        </form>
    );
}
