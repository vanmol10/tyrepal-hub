import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, format } from "date-fns";

interface Vehicle {
  id: string;
  vehicle_brand: string;
  vehicle_model: string;
  registration_number: string;
}

interface TyrePurchase {
  id: string;
  tyre_brand: string;
  number_of_tyres: number;
  purchase_date: string;
  warranty_start_date?: string;
  warranty_end_date?: string;
  warranty_certificate_url?: string;
  tyre_serial_number?: string;
  vehicle_id: string;
  vehicles: Vehicle;
}

export default function Warranty() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [warranties, setWarranties] = useState<TyrePurchase[]>([]);

  useEffect(() => {
    checkAuth();
    fetchWarranties();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchWarranties = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tyre_purchases")
        .select(`
          *,
          vehicles (
            id,
            vehicle_brand,
            vehicle_model,
            registration_number
          )
        `)
        .eq("user_id", user.id)
        .not("warranty_start_date", "is", null)
        .order("warranty_end_date", { ascending: true });

      if (error) throw error;
      setWarranties(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWarrantyStatus = (warranty: TyrePurchase) => {
    if (!warranty.warranty_end_date) return { status: "unknown", color: "secondary", days: 0 };
    
    const today = new Date();
    const endDate = new Date(warranty.warranty_end_date);
    const daysRemaining = differenceInDays(endDate, today);

    if (daysRemaining < 0) {
      return { status: "expired", color: "destructive", days: Math.abs(daysRemaining) };
    } else if (daysRemaining < 30) {
      return { status: "expiring", color: "warning", days: daysRemaining };
    } else {
      return { status: "active", color: "success", days: daysRemaining };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Warranty Tracker
          </h1>
          <p className="text-muted-foreground">Monitor your tyre warranties and expiration dates</p>
        </div>

        {warranties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg mb-2">No warranties to track</p>
              <p className="text-muted-foreground">
                Add warranty information to your tyre purchases to track them here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {warranties.map((warranty) => {
              const status = getWarrantyStatus(warranty);
              const StatusIcon = status.status === 'expired' ? AlertTriangle : 
                               status.status === 'expiring' ? AlertTriangle : CheckCircle;

              return (
                <Card key={warranty.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {warranty.tyre_brand}
                          <Badge variant={
                            status.status === 'expired' ? 'destructive' : 
                            status.status === 'expiring' ? 'outline' : 
                            'default'
                          }>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.status === 'expired' ? 'Expired' : 
                             status.status === 'expiring' ? 'Expiring Soon' : 
                             'Active'}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {warranty.vehicles.vehicle_brand} {warranty.vehicles.vehicle_model} ({warranty.vehicles.registration_number})
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Number of Tyres</p>
                          <p className="font-semibold">{warranty.number_of_tyres}</p>
                        </div>
                        {warranty.tyre_serial_number && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Serial Number</p>
                            <p className="font-semibold text-sm">{warranty.tyre_serial_number}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {warranty.warranty_start_date && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Warranty Start</p>
                            <p className="font-semibold">
                              {format(new Date(warranty.warranty_start_date), "dd MMM yyyy")}
                            </p>
                          </div>
                        )}
                        {warranty.warranty_end_date && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Warranty End</p>
                            <p className="font-semibold">
                              {format(new Date(warranty.warranty_end_date), "dd MMM yyyy")}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t">
                        <p className={`text-sm font-medium ${
                          status.status === 'expired' ? 'text-destructive' : 
                          status.status === 'expiring' ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {status.status === 'expired' 
                            ? `Expired ${status.days} days ago` 
                            : status.status === 'expiring' 
                            ? `Expires in ${status.days} days` 
                            : `${status.days} days remaining`}
                        </p>
                      </div>

                      {warranty.warranty_certificate_url && (
                        <a
                          href={warranty.warranty_certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          View Certificate
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
