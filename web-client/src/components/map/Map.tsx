// components/map/Map.tsx
"use client";

import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

export const Map = ({ center, zoom, children }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries: ["places"],
    });
    if (loadError) {
        return <div>Error loading maps</div>;
    }
    if (!isLoaded) {
        return <div>Loading Maps...</div>;
    }

    const mapOptions = {
        disableDefaultUI: true,  // Disabilita l'interfaccia utente predefinita
    };

    return (
        <GoogleMap
            center={center}
            zoom={zoom}
            mapContainerStyle={{ width: "100%", height: "400px" }}
            options={mapOptions}
        >
            {center && (
                <Marker position={center} label="You are here" />
            )}
            {children}
        </GoogleMap>
    );
};

export const getUserLocation =() => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (err) => {
                    reject(err.message);
                }
            );
        }else {
            reject(" your browser doesn't support geolocation")
        }
    })
}

export const reverseGeocode = async (lat, lng) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address");
      }

      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const street = addressComponents.find(component => component.types.includes("route"));
        const streetNumber = addressComponents.find(component => component.types.includes("street_number"));

        if (street && streetNumber) {
          return `${street.long_name} ${streetNumber.long_name}`;
        } else {
          return "Unknown Street";
        }
      } else {
        throw new Error("No address found for the given coordinates");
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return "Unknown Location";
    }
  };


async function reverseGeocodeWithOSM(lat, lng) {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch address from OSM");
    }

    const data = await response.json();
    return data.display_name;
}