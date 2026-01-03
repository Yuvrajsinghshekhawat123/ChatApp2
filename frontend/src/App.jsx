import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "./04-layouts/publicRouts/MainLayout.jsx";
import { AuthLayout } from "./04-layouts/publicRouts/authLayout.jsx";
import { PrivateRoute } from "./04-layouts/privateRouts/PrivateRoute.jsx";
import { AuthRoute } from "./04-layouts/publicRouts/01-AuthRoute.jsx.jsx";
import "react-toastify/dist/ReactToastify.css";

// import the page only when need , do not import at all once
import { Suspense, lazy } from "react";
import { ClipLoader } from "react-spinners";
import { VerfiyLoginEmail } from "./05-Pages/ProtectedRoutes/02-verifyLoginUserEmail.jsx";
import { sessionLoader } from "./00-CreateGlobalSession/sessionLoader.jsx/session.jsx";
import { ResetPassword } from "./05-Pages/06-reset-Password.jsx";

const Login = lazy(() => import("./05-Pages/01-Login.jsx"));
const Register = lazy(() => import("./05-Pages/02-Register.jsx"));
const VerifyRegisterEmail = lazy(() =>
  import("./05-Pages/03-verifyRegisterEmail.jsx")
);
const Forgotpassword = lazy(() => import("./05-Pages/04-forgot-password.jsx"));
const VerifyForgotPasswordOTP = lazy(() =>
  import("./05-Pages/05-verifyForgotPasswordOTP.jsx")
);
const Home = lazy(() => import("./05-Pages/Home.jsx"));
const Dashboard = lazy(() =>
  import("./05-Pages/ProtectedRoutes/01-Dashboard.jsx")
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 60 * 60 * 1000, // 60 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false, // ← This prevents multiple calls
      refetchOnReconnect: false,
      retry: false,
    },
  },
});

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      loader: sessionLoader,
      element: <AuthRoute />,
      children: [
        {
          element: <MainLayout />,
          children: [{ index: true, element: <Home /> }],
        },
      ],
    },
    {
      path: "/auth",
      loader: sessionLoader,
      element: <AuthRoute />,
      children: [
        {
          element: <AuthLayout />,
          children: [
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            { path: "verify-email", element: <VerifyRegisterEmail /> },
            { path: "forgot-password", element: <Forgotpassword /> },
            { path: "verify-otp", element: <VerifyForgotPasswordOTP /> },
            { path: "reset-Password", element: <ResetPassword /> },
          ],
        },
      ],
    },

    {
      path: "/user/dashboard",
      loader: sessionLoader,
      element: <PrivateRoute />,
      children: [
        {
          index: true,
          element: <Dashboard />,
        },
        { path: "verify-email", element: <VerfiyLoginEmail /> },
      ],
    },
  ]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ToastContainer position="top-center" autoClose={3000} />
        <Suspense
          fallback={
            <div className="fixed inset-0 flex justify-center items-center bg-black">
              <ClipLoader color="#ffffff" size={50} />
            </div>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </QueryClientProvider>
    </>
  );
}

export default App;
