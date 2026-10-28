import { useEffect, useState } from "react";
import { getAccessToken } from "../services/auth.ts";
import {ResourceForm} from "../components/ResourceForm";
type Resource = {
    id: string,
    title: string,
    description: string,
    categoryId: string,
    isActive: boolean,
    type: "SKILL"|"RULE",
    supportedTool:string,
    usageInstructions:string;
}
export function AdminPage() {
    const [page, setPage]=useState(1)
    const [totalPages,setTotalPages]=useState(0)
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [editingResource,setEditingResource]=useState<Resource|null>(null);
    const [refreshKey, setRefreshKey]=useState(0);
    const [successMessage, setSuccessMessage] = useState("");
    useEffect(() => {
        const loadResources = async () => {
            try {
                const token = getAccessToken();
                if (!token) {
                    throw new Error("נדרשת התחברות כדי להציג את המשאבים");
                }
                const meResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/resources?page=${page}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if(meResponse.status === 401){
                    throw new Error("אסימון הגישה אינו תקין או פג תוקף. אנא התחבר מחדש.");
                } 
                if(response.status === 401){
                    throw new Error("אסימון הגישה אינו תקין או פג תוקף. אנא התחבר מחדש.");
                }
                if(response.status === 403){
                    throw new Error("אין לך הרשאות מנהל כדי להציג את הדף הזה");
                }
                if (!meResponse.ok) {
                    throw new Error("שגיאה בטעינת פרטי המשתמש");
                }
                if (!response.ok) {
                    throw new Error("שגיאה בטעינת המשאבים");
                }
                const me = await meResponse.json();
                if (me.role!== "ADMIN") {
                    throw new Error("אין לך הרשאות מנהל כדי להציג את הדף הזה");
                }
                const resources = await response.json();
                setResources(resources.items);
                setTotalPages(resources.totalPages);
            } catch (error) {
                setError(error instanceof Error ? error.message : "שגיאה בטעינת המשאבים");
            } finally {
                setLoading(false);
            }
        };
        loadResources();
    }, [refreshKey,page]);
    const handleToggleActive = async (resource: Resource) => {
        try {
            const token = getAccessToken();
            if (!token) {
                alert("נדרשת התחברות כמנהל כדי לעדכן את מצב המשאב");
                return;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/resources/${resource.id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ isActive :!resource.isActive })
            });
            if (!response.ok) {
                throw new Error("שגיאה בעדכון מצב המשאב");
            }
            const updatedResource: Resource = await response.json();
            setResources(prevResources =>
                prevResources.map(r =>
                    r.id === updatedResource.id ? { ...updatedResource } : r
                )
            );
        } catch (error) {
            alert(error instanceof Error ? error.message : "שגיאה בעדכון מצב המשאב");
        }
    };
    if (loading) {
        return <div>טוען...</div>;
    }
    if (error) {
        return <div>שגיאה: {error}</div>;
    }
    return (
        <div>
            <h1 className="mb-6 text-3xl font-bold text-indigo-700">ניהול משאבים</h1>
            {successMessage && (
                <p
                    role="status"
                    className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
                >
                    {successMessage}
                </p>
            )}
            <ResourceForm key={editingResource?.id??"new"}
            resource={editingResource}
            onSaved={(message) => {
                setSuccessMessage(message);
                setEditingResource(null);
                setRefreshKey((current) => current + 1);
            }}/>
            {editingResource&&(
                <button
                className="mb-6 rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100"
                type="button"
                onClick={()=>setEditingResource(null)}>
                    ביטול עריכה
                </button>
            )}
            {editingResource && (
                <p>נבחר לעריכה:{editingResource.title}</p>
            )}
            {resources.length === 0 ? (
                <p>אין משאבים להצגה</p>
            ) : (
                <ul className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
                    {resources.map((resource) => (
                        <li 
                            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                            key={resource.id}>
                            <h2 className="mb-3 text-lg font-bold text-slate-900">{resource.title}</h2>
                            <p className="mb-4 text-sm leading-7 text-slate-600">{resource.description}</p>
                            <p className="mb-4 text-sm font-medium text-slate-600">מצב: {resource.isActive ? "פעיל" : "לא פעיל"}</p>
                            <button 
                            className="ms-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
                            type="button"
                            onClick={() => handleToggleActive(resource)}>
                                {resource.isActive ? "השבת" : "הפעל"}
                            </button>
                            <button
                            className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                            type="button"
                            onClick={() => {
                                setSuccessMessage("");
                                setEditingResource(resource);}}>
                                ערוך
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {totalPages>0&&(
                <div>
                    <button
                        type="button"
                        disabled={page<=1}
                        onClick={()=>{
                            setEditingResource(null)
                            setPage((current)=>current-1);
                        }}>
                            הקודם
                        </button>
                        <span>  עמוד {page} מתוך {totalPages}  </span>
                        <button
                        type="button"
                        disabled={page>=totalPages}
                        onClick={()=>{
                            setEditingResource(null)
                            setPage((current)=>current+1)
                        }}>
                            הבא
                        </button>
                    </div>
            )}
        </div>
    )
}