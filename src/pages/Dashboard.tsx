import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Car, Package, Wrench, Calendar, AlertTriangle, Bell } from "lucide-react";
import { differenceInMonths, format } from "date-fns";

interface TyrePurchase {
  id: string;
  tyre_brand: string;
  purchase_date: string;
  vehicle_id: string;
  vehicles: {
    vehicle_brand: string;
    vehicle_model: string;
    registration_number: string;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<TyrePurchase[]>([]);

  useEffect(() => {
    checkAuth();
    fetchMaintenanceAlerts();
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    } else {
      setLoading(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  };

  const fetchMaintenanceAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("tyre_purchases")
        .select(`
          *,
          vehicles (
            vehicle_brand,
            vehicle_model,
            registration_number
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      // Filter purchases that are 3+ months old
      const alerts = (data || []).filter((purchase) => {
        const monthsSincePurchase = differenceInMonths(
          new Date(),
          new Date(purchase.purchase_date)
        );
        return monthsSincePurchase >= 3;
      });

      setMaintenanceAlerts(alerts);
    } catch (error) {
      console.error("Error fetching maintenance alerts:", error);
    }
  };

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

        {maintenanceAlerts.length > 0 && (
          <Alert className="mb-6 border-orange-500 bg-orange-50">
            <Bell className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-600">Maintenance Reminders</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 mt-2">
                {maintenanceAlerts.map((alert) => (
                  <div key={alert.id} className="text-sm">
                    <strong>{alert.vehicles.vehicle_brand} {alert.vehicles.vehicle_model}</strong> ({alert.tyre_brand}) - 
                    Purchased on {format(new Date(alert.purchase_date), "dd MMM yyyy")} - 
                    <span className="text-orange-700"> Check tyre condition</span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

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
