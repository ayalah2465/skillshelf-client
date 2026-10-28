import {useEffect,useState} from "react";
import { Link } from "react-router-dom";
type Resource = {
    id: string,
    title: string,
    description: string,
    categoryId: string,
}
type Category = {
    id: string,
    name: string,
}
export function CatalogPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState<string>("");
    const [categoriesError, setCategoriesError] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [search, setSearch] = useState<string>("");
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    useEffect(() => {
        const controller = new AbortController();
        const loadCategories = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`,{signal:controller.signal});
                
                if (!response.ok) {
                    throw new Error("שגיאה בטעינת הקטגוריות");
                }
                const categories = await response.json();
                setCategories(categories);
                if(!controller.signal.aborted){
                    setCategories(categories.items);
                }
            } catch (error) {
                if(!controller.signal.aborted){
                    setCategoriesError(error instanceof Error ? error.message : "שגיאה בטעינת הקטגוריות");
                }
            }
        };
        loadCategories();
        return () => {
            controller.abort();
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const loadResources = async () => {
            setLoading(true);
            setError("");
            try {
                const params = new URLSearchParams({
                    search: search.trim(),
                    page: String(page),
                });
                if(type){
                    params.set("type", type);
                }
                if(categoryId){
                    params.set("categoryId", categoryId);
                }
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources?${params}`, {
                    signal: controller.signal
                });
                if (!response.ok) {
                    throw new Error("שגיאה בטעינת המשאבים");
                }
                const resources = await response.json();
                if(!controller.signal.aborted){
                    setResources(resources.items);
                    setTotalPages(resources.totalPages);
                }
            } catch (error) {
                if(!controller.signal.aborted){
                    setError(error instanceof Error ? error.message : "שגיאה בטעינת המשאבים");
                }
            } finally {
                if(!controller.signal.aborted){
                    setLoading(false);
                }
            }
        };
        const timer = window.setTimeout(loadResources, 300);
        return () => {
            controller.abort();
            window.clearTimeout(timer);
        }
    }, [search, page, type, categoryId]);


    return (
        <div>
            <h1 className="text-3xl font-bold text-indigo-700 mb-6">
             קטלוג משאבים
            </h1>
            <div className="mb-8 flex items-end gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <input
                type="text"
                placeholder="חיפוש..."
                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={100}
                value={search}
                onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            />
            <label className="flex flex-col gap-2 text-sm font-medium">
                סוג משאב:
                <select value={type}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => {setType(e.target.value); setPage(1);}}>
                    <option value="">כל הסוגים</option>
                    <option value="SKILL">Skill</option>
                    <option value="RULE">Rule</option>
                </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
                קטגוריה:
                <select value={categoryId}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => {setCategoryId(e.target.value); setPage(1);}}>
                    <option value="">כל הקטגוריות</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </label>
            </div>
            {categoriesError && <p>{categoriesError}</p>}
            {loading ? (
                <p>טוען משאבים...</p>
            ) : error ? (
                <p>שגיאה: {error}</p>
            ) : resources.length === 0 ? (
                <p>אין משאבים זמינים.</p>
            ) : (
                <ul className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
                    {resources.map((resource) => (
                        <li 
                        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md text-right"
                        key={resource.id}>
                            <h2 className="mb-3 text-lg font-bold text-indigo-700"><Link to={`/resources/${resource.id}`}>{resource.title}</Link></h2>
                            <p className="text-sm leading-7 text-slate-600">{resource.description}</p>
                        </li>
                    ))}
                </ul>
            )}
            {!error && totalPages > 0 && (
                <div>
                    <button
                     type="button"
                     disabled={loading || page <= 1}
                     onClick={() => setPage((prev) => prev-1)}>
                       הקודם
                    </button>
                    <span>עמוד {page} מתוך {totalPages}</span>
                    <button
                     type="button"
                     disabled={loading || page >= totalPages}
                     onClick={() => setPage((prev) => prev+1)}>
                       הבא
                    </button>
                </div>
            )}
        </div>
    );
}

