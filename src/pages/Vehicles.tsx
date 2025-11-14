import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Car, Plus, Pencil, Trash2 } from "lucide-react";
import { Loader2 } from "lucide-react";

interface Vehicle {
  id: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_variant: string | null;
  vehicle_year: number;
  registration_number: string;
  current_kms: number;
  kms_per_day: number | null;
  kms_per_month: number | null;
}

export default function Vehicles() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_brand: "",
    vehicle_model: "",
    vehicle_variant: "",
    vehicle_year: new Date().getFullYear(),
    registration_number: "",
    current_kms: 0,
    kms_per_day: 0,
    kms_per_month: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchVehicles();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
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

      const { error } = await supabase.from("vehicles").insert([
        {
          ...formData,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Vehicle added successfully.",
      });

      setIsOpen(false);
      setFormData({
        vehicle_brand: "",
        vehicle_model: "",
        vehicle_variant: "",
        vehicle_year: new Date().getFullYear(),
        registration_number: "",
        current_kms: 0,
        kms_per_day: 0,
        kms_per_month: 0,
      });
      fetchVehicles();
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Vehicle deleted successfully.",
      });

      fetchVehicles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Vehicles</h1>
            <p className="text-muted-foreground">Manage your registered vehicles</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
                <DialogDescription>
                  Enter your vehicle details below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Vehicle Brand *</Label>
                  <Input
                    id="brand"
                    value={formData.vehicle_brand}
                    onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Vehicle Model *</Label>
                  <Input
                    id="model"
                    value={formData.vehicle_model}
                    onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variant">Variant</Label>
                  <Input
                    id="variant"
                    value={formData.vehicle_variant}
                    onChange={(e) => setFormData({ ...formData, vehicle_variant: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.vehicle_year}
                    onChange={(e) => setFormData({ ...formData, vehicle_year: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg">Registration Number *</Label>
                  <Input
                    id="reg"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kms">Current KMs *</Label>
                  <Input
                    id="kms"
                    type="number"
                    value={formData.current_kms}
                    onChange={(e) => setFormData({ ...formData, current_kms: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Vehicle
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading && vehicles.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : vehicles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Car className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No vehicles yet</h3>
              <p className="text-muted-foreground mb-4">Add your first vehicle to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{vehicle.vehicle_brand} {vehicle.vehicle_model}</CardTitle>
                      <CardDescription>
                        {vehicle.vehicle_variant && `${vehicle.vehicle_variant} • `}
                        {vehicle.vehicle_year}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(vehicle.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Registration:</span>
                    <span className="font-medium">{vehicle.registration_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current KMs:</span>
                    <span className="font-medium">{vehicle.current_kms.toLocaleString()}</span>
                  </div>
                  {vehicle.kms_per_month && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">KMs/Month:</span>
                      <span className="font-medium">{vehicle.kms_per_month}</span>
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
