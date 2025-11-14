import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Loader2, AlertCircle, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Vehicle {
  id: string;
  vehicle_brand: string;
  vehicle_model: string;
  registration_number: string;
}

interface Dealer {
  id: string;
  dealer_name: string;
  address: string;
  city: string;
  contact_number: string;
  opening_time: string;
  closing_time: string;
}

const SERVICE_TYPES = [
  { value: "wheel_alignment", label: "Wheel Alignment" },
  { value: "wheel_balancing", label: "Wheel Balancing" },
  { value: "tyre_rotation", label: "Tyre Rotation" },
  { value: "nitrogen_filling", label: "Nitrogen Filling" },
  { value: "air_pressure_check", label: "Air Pressure Check" },
];

export default function Booking() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [formData, setFormData] = useState<{
    vehicle_id: string;
    dealer_id: string;
    service_type: "wheel_alignment" | "wheel_balancing" | "tyre_rotation" | "nitrogen_filling" | "air_pressure_check" | "";
    booking_date: string;
    booking_time: string;
    notes: string;
  }>({
    vehicle_id: "",
    dealer_id: "",
    service_type: "",
    booking_date: format(new Date(), "yyyy-MM-dd"),
    booking_time: "10:00",
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
      const [vehiclesRes, dealersRes] = await Promise.all([
        supabase.from("vehicles").select("*"),
        supabase.from("dealers").select("*").eq("is_active", true),
      ]);

      if (vehiclesRes.error) throw vehiclesRes.error;
      if (dealersRes.error) throw dealersRes.error;

      setVehicles(vehiclesRes.data || []);
      setDealers(dealersRes.data || []);
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

      const { error } = await supabase.from("bookings").insert([
        {
          vehicle_id: formData.vehicle_id,
          dealer_id: formData.dealer_id,
          service_type: formData.service_type as "wheel_alignment" | "wheel_balancing" | "tyre_rotation" | "nitrogen_filling" | "air_pressure_check",
          booking_date: formData.booking_date,
          booking_time: formData.booking_time,
          notes: formData.notes,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: "Your service booking has been created successfully.",
      });

      setFormData({
        vehicle_id: "",
        dealer_id: "",
        service_type: "",
        booking_date: format(new Date(), "yyyy-MM-dd"),
        booking_time: "10:00",
        notes: "",
      });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No vehicles added</h3>
              <p className="text-muted-foreground mb-4">Add a vehicle first to book a service</p>
              <Button onClick={() => navigate("/vehicles")}>Add Vehicle</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Book a Service</h1>
          <p className="text-muted-foreground">Schedule your vehicle maintenance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Service Booking Form</CardTitle>
              <CardDescription>Fill in the details to book your service</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Select Vehicle *</Label>
                  <Select value={formData.vehicle_id} onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your vehicle" />
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
                  <Label htmlFor="dealer">Select Dealer *</Label>
                  <Select value={formData.dealer_id} onValueChange={(value) => setFormData({ ...formData, dealer_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a dealer" />
                    </SelectTrigger>
                    <SelectContent>
                      {dealers.map((dealer) => (
                        <SelectItem key={dealer.id} value={dealer.id}>
                          {dealer.dealer_name} - {dealer.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-type">Service Type *</Label>
                  <Select value={formData.service_type} onValueChange={(value) => setFormData({ ...formData, service_type: value as typeof formData.service_type })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="booking-date">Date *</Label>
                    <Input
                      id="booking-date"
                      type="date"
                      value={formData.booking_date}
                      onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                      min={format(new Date(), "yyyy-MM-dd")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-time">Time *</Label>
                    <Input
                      id="booking-time"
                      type="time"
                      value={formData.booking_time}
                      onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any specific requirements or concerns..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Confirm Booking
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Dealers</CardTitle>
                <CardDescription>Select from our trusted partners</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dealers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No dealers available at the moment</p>
                  </div>
                ) : (
                  dealers.map((dealer) => (
                    <div key={dealer.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                      <h3 className="font-semibold mb-2">{dealer.dealer_name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{dealer.address}, {dealer.city}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Contact:</span>
                        <span className="font-medium">{dealer.contact_number}</span>
                      </div>
                      {dealer.opening_time && dealer.closing_time && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Hours:</span>
                          <span className="font-medium">
                            {dealer.opening_time} - {dealer.closing_time}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
