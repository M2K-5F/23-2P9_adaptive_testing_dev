import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/api.service";
import { Button } from "@/components";

export default function ForbiddenPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-slate-800 mb-2">403</h1>
          
          <h2 className="text-2xl font-semibold text-slate-700 mb-4">
            Доступ запрещён
          </h2>
          
          <p className="text-slate-600 mb-2">
            У вас нет прав для просмотра этой страницы.
          </p>
          
          <div className="mt-8 flex w-full justify-center">
            <Button 
              onClick={() => {
                logoutUser().then(() => navigate('/users/autorize'))
              }}
            >
              Вернуться на главную
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}