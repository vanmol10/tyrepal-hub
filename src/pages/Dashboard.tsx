import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Package, Wrench, Calendar } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  const dashboardItems = [
    {
      title: "My Vehicles",
      description: "Manage your registered vehicles",
      icon: Car,
      href: "/vehicles",
    },
    {
      title: "Tyre Purchases",
      description: "View your tyre purchase history",
      icon: Package,
      href: "/purchases",
    },
    {
      title: "Service Records",
      description: "Track maintenance & services",
      icon: Wrench,
      href: "/services",
    },
    {
      title: "Book Service",
      description: "Schedule your next service",
      icon: Calendar,
      href: "/booking",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your vehicles and tyre services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
                onClick={() => navigate(item.href)}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
