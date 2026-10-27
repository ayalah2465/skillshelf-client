import {z} from "zod"
import { saveAccessToken } from "../services/auth";
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
// const registerSchema=z.object({
//     displayName:z.string().min(3,"שם המשתמש חייב להכיל לפחות 3 תווים"),
//     email:z.string().email("מייל לא תקין"),
// });
// type registerFormData=z.infer<typeof registerSchema>
export function RegisterForm(){
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
    const onSubmit=async(data:registerFormData)=>{
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
            alert("הרשמה בוצעה בהצלחה");
            reset();
        }catch(error){
            const message=error instanceof Error?error.message:"שגיאה ברישום";
            alert(message);
        }
    };
    return(
        <form
        onSubmit={handleSubmit(onSubmit)}
        style={{maxWidth:"400px",display:"flex",flexDirection:"column",gap:"10px"}}
        >
            <div>
                <input{...register("displayName")}placeholder="שם משתמש"/>
                {errors.displayName&&<p style={{color:"red",margin:0}}>{errors.displayName.message}</p>}
            </div>
            <div>
                <input type="email"{...register("email")}placeholder="אימייל"/>
                {errors.email&&<p style={{color:"red",margin:0}}>{errors.email.message}</p>}
            </div>
            <div>
                <input type="password"{...register("password")}placeholder="סיסמה"/>
                {errors.password&&<p style={{color:"red",margin:0}}>{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={!isValid||isSubmitting}>
                {isSubmitting?"להרשמה...":"שולח"}
            </button>
        </form>
    );
}
