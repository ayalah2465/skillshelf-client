import { getAccessToken } from "../services/auth";
import {useEffect,useState} from "react";
import { Link } from "react-router-dom";
type Resource = {
    id: string,
    title: string,
    description: string,
}
export function FavoritesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    useEffect(() => {
        const loadResources = async () => {
            try {
                const token = getAccessToken();
                if (!token) {
                    throw new Error("נדרשת התחברות כדי להסת את המשאבים המועדפים");
                }
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
                );
                if(response.status === 401){
                    throw new Error("אסימון הגישה אינו תקין או פג תוקף. אנא התחבר מחדש.");
                }
                if (!response.ok) {
                    throw new Error("שגיאה בטעינת המשאבים");
                }
                const resources = await response.json();
                setResources(resources.items);
            } catch (error) {
                setError(error instanceof Error ? error.message : "שגיאה בטעינת המשאבים");
            } finally {
                setLoading(false);
            }
        };

        loadResources();
    }, []);

    const handleRemoveFromFavorites = async (resourceId: string) => {
        try {
            const token = getAccessToken();
            if (!token) {
                alert("נדרשת התחברות כדי להציג את המשאבים המועדפים");
                return;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites/${resourceId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.status === 401) {
                throw new Error("אסימון הגישה אינו תקין או פג תוקף. אנא התחבר מחדש.");
            }
            if (!response.ok) {
                throw new Error("שגיאה בהסרה מהמועדפים");
            }
            setResources((current) => current.filter((r) => r.id !== resourceId));
        } catch (error) {
            alert(error instanceof Error ? error.message : "שגיאה בהסרה מהמועדפים");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1 className="mb-6 text-3xl font-bold text-indigo-700">מועדפים</h1>
            {resources.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">אין משאבים מועדפים.</p>
            ) : (
                <ul className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
                    {resources.map((resource) => (
                        <li 
                            className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                            key={resource.id}>
                            <h2 className="mb-3 text-lg font-bold text-indigo-700"><Link to={`/resources/${resource.id}`}>{resource.title}</Link></h2>
                            <p className="mb-5 flex-1 text-sm leading-7 text-slate-600">{resource.description}</p>
                            <button 
                            className="self-start rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                            type="button"
                            onClick={ () => 
                                handleRemoveFromFavorites(resource.id)}>הסר ממועדפים</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
  );
}
