import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Vehicle {
  id: string;
  vehicle_brand: string;
  vehicle_model: string;
  registration_number: string;
}

interface TyrePurchase {
  id: string;
  number_of_tyres: number;
  tyre_brand: string;
  tyre_serial_number: string | null;
  warranty_start_date: string | null;
  warranty_end_date: string | null;
  purchase_date: string;
  vehicles: {
    vehicle_brand: string;
    vehicle_model: string;
    registration_number: string;
  };
}

export default function Purchases() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<TyrePurchase[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: "",
    number_of_tyres: 4,
    tyre_brand: "",
    tyre_serial_number: "",
    purchase_date: format(new Date(), "yyyy-MM-dd"),
    warranty_start_date: format(new Date(), "yyyy-MM-dd"),
    warranty_end_date: "",
  });

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchData = async () => {
    try {
      const [purchasesRes, vehiclesRes] = await Promise.all([
        supabase
          .from("tyre_purchases")
          .select(`
            *,
            vehicles (
              vehicle_brand,
              vehicle_model,
              registration_number
            )
          `)
          .order("purchase_date", { ascending: false }),
        supabase.from("vehicles").select("id, vehicle_brand, vehicle_model, registration_number"),
      ]);

      if (purchasesRes.error) throw purchasesRes.error;
      if (vehiclesRes.error) throw vehiclesRes.error;

      setPurchases(purchasesRes.data || []);
      setVehicles(vehiclesRes.data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("tyre_purchases").insert([
        {
          ...formData,
          user_id: user.id,
          warranty_end_date: formData.warranty_end_date || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Tyre purchase recorded successfully.",
      });

      setIsOpen(false);
      setFormData({
        vehicle_id: "",
        number_of_tyres: 4,
        tyre_brand: "",
        tyre_serial_number: "",
        purchase_date: format(new Date(), "yyyy-MM-dd"),
        warranty_start_date: format(new Date(), "yyyy-MM-dd"),
        warranty_end_date: "",
      });
      fetchData();
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

  const isWarrantyExpiringSoon = (endDate: string | null) => {
    if (!endDate) return false;
    const today = new Date();
    const warranty = new Date(endDate);
    const daysRemaining = Math.ceil((warranty.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 && daysRemaining <= 30;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Tyre Purchases</h1>
            <p className="text-muted-foreground">Track your tyre purchase history & warranties</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button disabled={vehicles.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add Purchase
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Tyre Purchase</DialogTitle>
                <DialogDescription>
                  Add details of your tyre purchase
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle *</Label>
                  <Select value={formData.vehicle_id} onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicle_brand} {vehicle.vehicle_model} - {vehicle.registration_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Tyre Brand *</Label>
                  <Input
                    id="brand"
                    value={formData.tyre_brand}
                    onChange={(e) => setFormData({ ...formData, tyre_brand: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Number of Tyres *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="6"
                    value={formData.number_of_tyres}
                    onChange={(e) => setFormData({ ...formData, number_of_tyres: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serial">Serial Number</Label>
                  <Input
                    id="serial"
                    value={formData.tyre_serial_number}
                    onChange={(e) => setFormData({ ...formData, tyre_serial_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase-date">Purchase Date *</Label>
                  <Input
                    id="purchase-date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty-start">Warranty Start Date *</Label>
                  <Input
                    id="warranty-start"
                    type="date"
                    value={formData.warranty_start_date}
                    onChange={(e) => setFormData({ ...formData, warranty_start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty-end">Warranty End Date</Label>
                  <Input
                    id="warranty-end"
                    type="date"
                    value={formData.warranty_end_date}
                    onChange={(e) => setFormData({ ...formData, warranty_end_date: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Record Purchase
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {vehicles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No vehicles added</h3>
              <p className="text-muted-foreground mb-4">Add a vehicle first to track tyre purchases</p>
              <Button onClick={() => navigate("/vehicles")}>Add Vehicle</Button>
            </CardContent>
          </Card>
        ) : loading && purchases.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : purchases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
              <p className="text-muted-foreground mb-4">Start tracking your tyre purchases</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className={isWarrantyExpiringSoon(purchase.warranty_end_date) ? "border-yellow-500" : ""}>
                <CardHeader>
                  <CardTitle>{purchase.tyre_brand}</CardTitle>
                  <CardDescription>
                    {purchase.vehicles.vehicle_brand} {purchase.vehicles.vehicle_model}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium">{purchase.number_of_tyres} tyres</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Purchase Date:</span>
                    <span className="font-medium">{format(new Date(purchase.purchase_date), "dd MMM yyyy")}</span>
                  </div>
                  {purchase.warranty_end_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Warranty Ends:</span>
                      <span className={`font-medium ${isWarrantyExpiringSoon(purchase.warranty_end_date) ? "text-yellow-500" : ""}`}>
                        {format(new Date(purchase.warranty_end_date), "dd MMM yyyy")}
                      </span>
                    </div>
                  )}
                  {isWarrantyExpiringSoon(purchase.warranty_end_date) && (
                    <div className="mt-2 p-2 bg-yellow-500/10 rounded-md flex items-center gap-2 text-xs text-yellow-500">
                      <AlertCircle className="h-4 w-4" />
                      Warranty expiring soon!
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
