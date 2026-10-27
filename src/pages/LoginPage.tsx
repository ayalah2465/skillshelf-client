import { saveAccessToken } from "../services/auth";
import {z} from "zod"
export const loginSchema=z.object({
    email:z.string().email("כתובת המייל אינה תקינה"),
    password:z.string()
    .min(10,"סיסמה חייבת להכיל לפחות 10 תווים")
    .regex(/[A-Z]/,"סיסמה חייבת להכיל לפחות אות גדולה אחת")
    .regex(/[a-z]/,"סיסמה חייבת להכיל לפחות אות קטנה אחת")
    .regex(/[0-9]/,"סיסמה חייבת להכיל לפחות ספרה אחת")
});
export type loginFormData=z.infer<typeof loginSchema>


import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

export function LoginForm(){
            const{
            register,
            handleSubmit,
            formState:{errors, isSubmitting, isValid},
        }=useForm<loginFormData>({
            resolver:zodResolver(loginSchema),
            mode:"onChange",
            defaultValues:{
                email:"",
                password:"",
            },
        });
    const submit=async(data:loginFormData)=>{
        try{
            const response=await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    email:data.email,
                    password:data.password,
                }),
            });
            const result:{
                accessToken?: string;
                error?:{message?:string};
            }=await response.json();
            if(!response.ok){
                throw new Error(result.error?.message??"שגיאה בהתחברות");
            }
            if(
                typeof result.accessToken!=="string"||
                result.accessToken.length===0
            ){
                throw new Error("שגיאה בהתחברות: לא התקבל אסימון גישה תקין מהשרת");
            }
            saveAccessToken(result.accessToken);
            alert("התחברות בוצעה בהצלחה");
        } catch (error) {
            const message=error instanceof Error?error.message:"שגיאה בהתחברות";
            alert(message);
        }
    };
        return(
        <form
        onSubmit={handleSubmit(submit)}
        style={{maxWidth:"400px",display:"flex",flexDirection:"column",gap:"10px"}}
        >
            <div>
                <input type="email"{...register("email")}placeholder="אימייל"/>
                {errors.email&&<p style={{color:"red",margin:0}}>{errors.email.message}</p>}
            </div>
            <div>
                <input type="password"{...register("password")}placeholder="סיסמה"/>
                {errors.password&&<p style={{color:"red",margin:0}}>{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={!isValid||isSubmitting}>
                {isSubmitting?"התחברות...":"התחבר"}
            </button>
        </form>
    );
}