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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Plus, Loader2, AlertCircle, Calendar as CalendarIcon, Car } from "lucide-react";
import { format } from "date-fns";

interface Vehicle {
  id: string;
  vehicle_brand: string;
  vehicle_model: string;
  registration_number: string;
  current_kms: number;
}

interface Service {
  id: string;
  service_type: string;
  current_kms: number;
  service_date: string;
  notes: string | null;
  vehicles: {
    vehicle_brand: string;
    vehicle_model: string;
    registration_number: string;
    current_kms: number;
  };
}

const SERVICE_TYPES = [
  { value: "wheel_alignment", label: "Wheel Alignment" },
  { value: "wheel_balancing", label: "Wheel Balancing" },
  { value: "tyre_rotation", label: "Tyre Rotation" },
  { value: "nitrogen_filling", label: "Nitrogen Filling" },
  { value: "air_pressure_check", label: "Air Pressure Check" },
];

export default function Services() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<{
    vehicle_id: string;
    service_type: "wheel_alignment" | "wheel_balancing" | "tyre_rotation" | "nitrogen_filling" | "air_pressure_check" | "";
    current_kms: number;
    service_date: string;
    notes: string;
  }>({
    vehicle_id: "",
    service_type: "",
    current_kms: 0,
    service_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
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
      const [servicesRes, vehiclesRes] = await Promise.all([
        supabase
          .from("services")
          .select(`
            *,
            vehicles (
              vehicle_brand,
              vehicle_model,
              registration_number,
              current_kms
            )
          `)
          .order("service_date", { ascending: false }),
        supabase.from("vehicles").select("*"),
      ]);

      if (servicesRes.error) throw servicesRes.error;
      if (vehiclesRes.error) throw vehiclesRes.error;

      setServices(servicesRes.data || []);
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

      if (!formData.service_type) {
        throw new Error("Please select a service type");
      }

      const { error } = await supabase.from("services").insert([
        {
          vehicle_id: formData.vehicle_id,
          service_type: formData.service_type as "wheel_alignment" | "wheel_balancing" | "tyre_rotation" | "nitrogen_filling" | "air_pressure_check",
          current_kms: formData.current_kms,
          service_date: formData.service_date,
          notes: formData.notes,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      // Update vehicle current_kms
      await supabase
        .from("vehicles")
        .update({ current_kms: formData.current_kms })
        .eq("id", formData.vehicle_id);

      toast({
        title: "Success!",
        description: "Service record added successfully.",
      });

      setIsOpen(false);
      setFormData({
        vehicle_id: "",
        service_type: "",
        current_kms: 0,
        service_date: format(new Date(), "yyyy-MM-dd"),
        notes: "",
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

  const needsAlignment = (service: Service) => {
    const lastAlignment = services.find(
      (s) => s.vehicles.registration_number === service.vehicles.registration_number && s.service_type === "wheel_alignment"
    );
    
    if (!lastAlignment) return false;
    
    const kmsSinceAlignment = service.vehicles.current_kms - lastAlignment.current_kms;
    return kmsSinceAlignment >= 5000;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Service Records</h1>
            <p className="text-muted-foreground">Track all your vehicle maintenance</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button disabled={vehicles.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Service</DialogTitle>
                <DialogDescription>
                  Add details of your vehicle service
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle *</Label>
                  <Select 
                    value={formData.vehicle_id} 
                    onValueChange={(value) => {
                      const vehicle = vehicles.find(v => v.id === value);
                      setFormData({ 
                        ...formData, 
                        vehicle_id: value,
                        current_kms: vehicle?.current_kms || 0
                      });
                    }}
                  >
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
                  <Label htmlFor="service-type">Service Type *</Label>
                  <Select value={formData.service_type} onValueChange={(value) => setFormData({ ...formData, service_type: value as typeof formData.service_type })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <div className="space-y-2">
                  <Label htmlFor="service-date">Service Date *</Label>
                  <Input
                    id="service-date"
                    type="date"
                    value={formData.service_date}
                    onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Service Record
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="cards">Card View</TabsTrigger>
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          </TabsList>

          <TabsContent value="cards">
            {vehicles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No vehicles added</h3>
                  <p className="text-muted-foreground mb-4">Add a vehicle first to track services</p>
                  <Button onClick={() => navigate("/vehicles")}>Add Vehicle</Button>
                </CardContent>
              </Card>
            ) : loading && services.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : services.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No service records yet</h3>
                  <p className="text-muted-foreground mb-4">Start tracking your vehicle services</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => {
                  const needsAlign = needsAlignment(service);
                  return (
                    <Card key={service.id} className={needsAlign ? "border-orange-500" : ""}>
                      <CardHeader>
                        <CardTitle>
                          {SERVICE_TYPES.find((t) => t.value === service.service_type)?.label}
                        </CardTitle>
                        <CardDescription>
                          {service.vehicles.vehicle_brand} {service.vehicles.vehicle_model}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{format(new Date(service.service_date), "dd MMM yyyy")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">KMs:</span>
                          <span className="font-medium">{service.current_kms.toLocaleString()}</span>
                        </div>
                        {service.notes && (
                          <div className="text-sm pt-2">
                            <span className="text-muted-foreground">Notes:</span>
                            <p className="mt-1 text-sm">{service.notes}</p>
                          </div>
                        )}
                        {needsAlign && (
                          <div className="flex items-start gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-md mt-3">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>Due for wheel alignment</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline">
            {vehicles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No vehicles added</h3>
                  <p className="text-muted-foreground mb-4">Add a vehicle first to track services</p>
                  <Button onClick={() => navigate("/vehicles")}>Add Vehicle</Button>
                </CardContent>
              </Card>
            ) : loading && services.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : services.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No service records yet</h3>
                  <p className="text-muted-foreground mb-4">Start tracking your vehicle services</p>
                </CardContent>
              </Card>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6 pl-12">
                  {services.map((service) => {
                    const needsAlign = needsAlignment(service);
                    return (
                      <div key={service.id} className="relative">
                        <div className="absolute -left-12 top-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Wrench className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <Card className={needsAlign ? "border-orange-500" : ""}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle>
                                  {SERVICE_TYPES.find((t) => t.value === service.service_type)?.label}
                                </CardTitle>
                                <CardDescription>
                                  {service.vehicles.vehicle_brand} {service.vehicles.vehicle_model} ({service.vehicles.registration_number})
                                </CardDescription>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(service.service_date), "dd MMM yyyy")}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Car className="h-4 w-4 text-muted-foreground" />
                                <span>{service.current_kms.toLocaleString()} km</span>
                              </div>
                              {service.notes && (
                                <p className="text-sm text-muted-foreground pt-2 border-t">
                                  {service.notes}
                                </p>
                              )}
                              {needsAlign && (
                                <div className="flex items-start gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
                                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span>Due for wheel alignment</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
