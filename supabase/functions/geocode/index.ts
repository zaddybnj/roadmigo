import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    
    if (!query || query.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 3 characters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Use Photon API (Komoot) - free, no rate limits, CORS-friendly alternative to Nominatim
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=en&osm_tag=place`;
    
    const response = await fetch(photonUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Photon returned ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Photon's GeoJSON format to match expected format
    const results = data.features?.map((feature: any) => ({
      name: feature.properties.name || feature.properties.city || feature.properties.county,
      display_name: [
        feature.properties.name,
        feature.properties.city,
        feature.properties.county,
        feature.properties.state,
        feature.properties.country
      ].filter(Boolean).join(', '),
      lat: feature.geometry.coordinates[1].toString(),
      lon: feature.geometry.coordinates[0].toString(),
    })) || [];
    
    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Geocoding error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch location data' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
