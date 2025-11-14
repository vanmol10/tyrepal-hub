import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";
import { Shield, Clock, Award, Wrench } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Warranty Tracking",
      description: "Never miss a warranty expiry with automatic alerts",
    },
    {
      icon: Clock,
      title: "Service Reminders",
      description: "Get notified when alignment is due every 5000 KMs",
    },
    {
      icon: Award,
      title: "Expert Recommendations",
      description: "Find the perfect tyres for your vehicle and usage",
    },
    {
      icon: Wrench,
      title: "Easy Booking",
      description: "Book services at your nearest dealer in seconds",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Tyre Workshop" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Your Complete{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Tyre Management
              </span>{" "}
              Solution
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-slide-up">
              Track purchases, manage warranties, schedule services, and get expert recommendations—all in one powerful platform.
            </p>
            <div className="flex flex-wrap gap-4 animate-slide-up">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="animate-glow"
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Tyre Care
            </h2>
            <p className="text-muted-foreground text-lg">
              Professional tools to keep your tyres in perfect condition
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="text-center p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Take Control?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of vehicle owners who trust TyreCare Pro for their tyre management needs.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="animate-glow"
            >
              Start Managing Your Tyres
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 TyreCare Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
