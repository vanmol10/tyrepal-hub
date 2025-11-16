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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Loader2, AlertCircle, MapPin } from "lucide-react";
import { format } from "date-fns";
import { DealerMap } from "@/components/DealerMap";

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
  const [formData, setFormData] = useState({
    vehicle_id: "",
    dealer_id: "",
    service_type: "" as any,
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
    if (!session) navigate("/auth");
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
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      if (!formData.service_type) throw new Error("Please select a service type");
      const { error } = await supabase.from("bookings").insert([{ ...formData, user_id: user.id }]);
      if (error) throw error;
      toast({ title: "Success", description: "Booking created successfully" });
      setFormData({ vehicle_id: "", dealer_id: "", service_type: "", booking_date: format(new Date(), "yyyy-MM-dd"), booking_time: "10:00", notes: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg mb-2">No vehicles added yet</p>
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
        <Tabs defaultValue="form">
          <TabsList className="mb-6">
            <TabsTrigger value="form">Booking Form</TabsTrigger>
            <TabsTrigger value="map">Dealer Map</TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <Card>
              <CardHeader><CardTitle>Service Booking</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><Label>Vehicle *</Label>
                    <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({ ...formData, vehicle_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                      <SelectContent>{vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.vehicle_brand} {v.vehicle_model}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Dealer *</Label>
                    <Select value={formData.dealer_id} onValueChange={(v) => setFormData({ ...formData, dealer_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                      <SelectContent>{dealers.map(d => <SelectItem key={d.id} value={d.id}>{d.dealer_name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Service *</Label>
                    <Select value={formData.service_type} onValueChange={(v: any) => setFormData({ ...formData, service_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{SERVICE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Date</Label><Input type="date" value={formData.booking_date} onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })} min={format(new Date(), "yyyy-MM-dd")} required /></div>
                    <div><Label>Time</Label><Input type="time" value={formData.booking_time} onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })} required /></div>
                  </div>
                  <div><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarIcon className="mr-2 h-4 w-4" />}Book</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="map">
            <Card>
              <CardHeader><CardTitle><MapPin className="inline h-5 w-5 mr-2" />Dealer Locations</CardTitle></CardHeader>
              <CardContent><DealerMap dealers={dealers} /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
