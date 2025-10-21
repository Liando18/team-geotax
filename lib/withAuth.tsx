import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function withAuth(Component: any) {
  return function ProtectedComponent(props: any) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
      } else {
        setIsLoading(false);
      }
    }, [router]);

    if (isLoading) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-slate-900">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
