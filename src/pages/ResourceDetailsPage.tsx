import { useEffect, useState} from 'react'
import { useParams } from 'react-router-dom';
import {getAccessToken} from "../services/auth.ts";
type Resource = {
    id: string,
    title: string,
    description: string,
    usageInstructions: string,
    fileName: string,
}
export function ResourceDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [resource, setResource] = useState<Resource | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const loadResource = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/${id}`);
                if (!response.ok) {
                    throw new Error("שגיאה בטעינת פרטי המשאב");
                }
                const resource = await response.json();
                setResource(resource);
            } catch (error) {
                setError(error instanceof Error ? error.message : "שגיאה בטעינת פרטי המשאב");
            } finally {
                setLoading(false);
            }
        };

        loadResource();
    }, [id]);
    const handleDownload = async () => {
        if (!resource) return;
        const token = getAccessToken();
        if (!token) {
            alert("נדרשת התחברות כדי להוריד את הקובץ");
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/${resource.id}/download`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if(response.status === 401){
                alert("אסימון הגישה אינו תקין או פג תוקף. אנא התחבר מחדש.");
                return;
            }
            if (!response.ok) {
                throw new Error("שגיאה בהורדת הקובץ");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = resource.fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert(error instanceof Error ? error.message : "שגיאה בהורדת הקובץ");
        }
    };

    const handleAddFavorite = async () => {
        if (!resource) return;

        const token = getAccessToken();
        if (!token) {
            alert("נדרשת התחברות כדי להוסיף למועדפים");
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites/${resource.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if(response.status === 401){
                alert("אסימון הגישה אינו תקין או פג תוקף. אנא התחבר מחדש.");
                return;
            }
            if (!response.ok) {
                throw new Error("שגיאה בהוספת למועדפים");
            }
            alert("המשאב נוסף למועדפים בהצלחה");
        } catch (error) {
            alert(error instanceof Error ? error.message : "שגיאה בהוספת למועדפים");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!resource) return <p>המשאב לא נמצא.</p>;

    return (
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="mb-4 text-3xl font-bold text-slate-900">{resource.title}</h1>
            <p className="mb-8 leading-8 text-slate-600">{resource.description}</p>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">הוראות שימוש</h2>
            <p 
            className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-5 leading-8 text-slate-700">
                {resource.usageInstructions}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
            <button
             className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
             type="button" onClick={handleDownload}>הורד קובץ</button>
            <button 
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-100"
            type="button" onClick={handleAddFavorite}>הוסף למועדפים</button>
            </div>
        </div>
    );
}