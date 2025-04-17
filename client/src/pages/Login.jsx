import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Header from "@/pages/Header";  // Import the Header component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/services/api";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await loginUser(data);
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />  {/* Add the Header component */}
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Input placeholder="Email" {...register("email", { required: true })} className="h-12" />
              <Input type="password" placeholder="Password" {...register("password", { required: true })} className="h-12" />
              <Button type="submit" className="w-full h-12 text-lg">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
