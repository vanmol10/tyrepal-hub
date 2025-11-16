import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Dealer {
  id: string;
  dealer_name: string;
  address: string;
  city: string;
  state: string;
  contact_number: string;
  opening_time?: string;
  closing_time?: string;
  latitude?: number;
  longitude?: number;
}

interface DealerMapProps {
  dealers: Dealer[];
}

export const DealerMap = ({ dealers }: DealerMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
    if (token) {
      setMapboxToken(token);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [78.9629, 20.5937], // Center of India
      zoom: 4,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for dealers
    dealers.forEach((dealer) => {
      if (dealer.latitude && dealer.longitude && map.current) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${dealer.dealer_name}</h3>
            <p class="text-sm">${dealer.address}, ${dealer.city}</p>
            <p class="text-sm">${dealer.contact_number}</p>
            ${dealer.opening_time && dealer.closing_time ? 
              `<p class="text-sm">Hours: ${dealer.opening_time} - ${dealer.closing_time}</p>` : ''}
          </div>
        `);

        new mapboxgl.Marker({ color: '#FF6B6B' })
          .setLngLat([dealer.longitude, dealer.latitude])
          .setPopup(popup)
          .addTo(map.current);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [dealers, mapboxToken]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Please configure Mapbox token to view the map</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
    </div>
  );
};
