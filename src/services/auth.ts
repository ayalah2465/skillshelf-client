const TOKEN_KEY = "skillshelf_access_token";
const API_URL = import.meta.env.VITE_API_URL;
export function saveAccessToken(token: string): void {
  sessionStorage.setItem("skillshelf_access_token", token);
}
export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}
export function clearAccessToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}
export async function authenticatedFetch(
    path: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = getAccessToken();
    if (!token) {
        throw new Error("נדרשת התחברות כדי לבצע בקשה זו");
    }
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });
    if(response.status === 401){
        clearAccessToken();
        throw new Error("אסימון הגישה אינו תקין או פג תוקף. אנא התחבר מחדש.");
    }
    return response;
}