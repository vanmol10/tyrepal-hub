import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TyreSize {
  width: number;
  aspectRatio: number;
  rimDiameter: number;
}

interface CalculationResults {
  oldDiameter: number;
  newDiameter: number;
  diameterChange: number;
  diameterChangePercent: number;
  speedometerError: number;
  heightDifference: number;
  widthDifference: number;
  fitmentCompatible: boolean;
}

const TyreCalculator = () => {
  const [oldSize, setOldSize] = useState("");
  const [newSize, setNewSize] = useState("");
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [error, setError] = useState("");

  const parseTyreSize = (size: string): TyreSize | null => {
    const pattern = /^(\d{3})\/(\d{2})\s*R\s*(\d{2})$/i;
    const match = size.trim().match(pattern);
    
    if (!match) return null;
    
    return {
      width: parseInt(match[1]),
      aspectRatio: parseInt(match[2]),
      rimDiameter: parseInt(match[3])
    };
  };

  const calculateDiameter = (tyre: TyreSize): number => {
    const sidewallHeight = (tyre.width * tyre.aspectRatio) / 100;
    const rimDiameterMm = tyre.rimDiameter * 25.4;
    return (2 * sidewallHeight) + rimDiameterMm;
  };

  const handleCalculate = () => {
    setError("");
    setResults(null);

    const oldTyre = parseTyreSize(oldSize);
    const newTyre = parseTyreSize(newSize);

    if (!oldTyre || !newTyre) {
      setError("Invalid tyre size format. Use format: 185/65 R15");
      return;
    }

    const oldDiameter = calculateDiameter(oldTyre);
    const newDiameter = calculateDiameter(newTyre);
    const diameterChange = newDiameter - oldDiameter;
    const diameterChangePercent = (diameterChange / oldDiameter) * 100;
    const speedometerError = diameterChangePercent;
    
    const oldSidewallHeight = (oldTyre.width * oldTyre.aspectRatio) / 100;
    const newSidewallHeight = (newTyre.width * newTyre.aspectRatio) / 100;
    const heightDifference = newSidewallHeight - oldSidewallHeight;
    const widthDifference = newTyre.width - oldTyre.width;
    
    const fitmentCompatible = Math.abs(diameterChangePercent) <= 3;

    setResults({
      oldDiameter,
      newDiameter,
      diameterChange,
      diameterChangePercent,
      speedometerError,
      heightDifference,
      widthDifference,
      fitmentCompatible
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Tyre Size Calculator</h1>
            <p className="text-muted-foreground">
              Compare two tyre sizes and calculate diameter, speedometer error, and fitment compatibility
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Enter Tyre Sizes
              </CardTitle>
              <CardDescription>
                Use format: WIDTH/ASPECT R RIM (e.g., 185/65 R15)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="oldSize">Current Tyre Size</Label>
                  <Input
                    id="oldSize"
                    placeholder="185/65 R15"
                    value={oldSize}
                    onChange={(e) => setOldSize(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newSize">New Tyre Size</Label>
                  <Input
                    id="newSize"
                    placeholder="195/60 R15"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleCalculate} className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
            </CardContent>
          </Card>

          {results && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {results.fitmentCompatible ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Compatible Fitment
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Incompatible Fitment
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {results.fitmentCompatible
                      ? "Diameter change is within acceptable range (±3%)"
                      : "Diameter change exceeds recommended range (±3%)"}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overall Diameter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Size</p>
                      <p className="text-2xl font-bold">{results.oldDiameter.toFixed(1)} mm</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">New Size</p>
                      <p className="text-2xl font-bold">{results.newDiameter.toFixed(1)} mm</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Diameter Change</p>
                    <p className="text-xl font-semibold">
                      {results.diameterChange > 0 ? "+" : ""}
                      {results.diameterChange.toFixed(1)} mm ({results.diameterChangePercent > 0 ? "+" : ""}
                      {results.diameterChangePercent.toFixed(2)}%)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Speedometer Error</CardTitle>
                  <CardDescription>
                    How much your speedometer reading will differ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold mb-2">
                    {results.speedometerError > 0 ? "+" : ""}
                    {results.speedometerError.toFixed(2)}%
                  </p>
                  <p className="text-muted-foreground text-sm">
                    At 100 km/h indicated speed, actual speed will be approximately{" "}
                    <span className="font-semibold">
                      {(100 + results.speedometerError).toFixed(1)} km/h
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dimensional Differences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Width Difference</p>
                      <p className="text-xl font-semibold">
                        {results.widthDifference > 0 ? "+" : ""}
                        {results.widthDifference} mm
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Sidewall Height Difference</p>
                      <p className="text-xl font-semibold">
                        {results.heightDifference > 0 ? "+" : ""}
                        {results.heightDifference.toFixed(1)} mm
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TyreCalculator;
