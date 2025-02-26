"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, getUserLocation } from "@/components/map/Map";
import { Marker, Autocomplete } from "@react-google-maps/api";

const LocationPage = () => {
    const router = useRouter();
    const [userLocation, setUserLocation] = useState(null);
    const [nearbySupers, setNearbySupers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [manualEntry, setManualEntry] = useState(false);
    const [inputAddress, setInputAddress] = useState("");
    const [autocomplete, setAutocomplete] = useState(null);

    // Fetch user location when the component mounts
    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const location = await getUserLocation();
                console.log("User location obtained:", location);
                setUserLocation(location);
                fetchNearbySupers(location.latitude, location.longitude);
            } catch (err) {
                console.error("Error obtaining user location:", err);
                setError("Error getting user location.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocation();
    }, []);

    // Fetch nearby supermarkets based on the provided latitude and longitude
    const fetchNearbySupers = async (latitude, longitude) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/nearby-supermarkets?lat=${latitude}&lng=${longitude}`
            );
            if (!response.ok) {
                console.error("Bad response from API for nearby supermarkets:", response.statusText);
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            console.log("Nearby supermarkets fetched successfully:", data.supermarkets);
            setNearbySupers(data.supermarkets);
        } catch (err) {
            console.error("Error fetching nearby supermarkets:", err);
            setError("Failed to fetch nearby supermarkets");
        } finally {
            setIsLoading(false);
        }
    };

    // Navigate to the supermarket's detail page
    const handleSupermartClick = (superId) => {
        console.log("Redirecting to supermarket with ID:", superId);
        router.push(`/supermarket/${superId}`);
    };

    // Enable manual location entry view
    const handleManualLocationEntry = () => {
        console.log("Switching to manual location entry");
        setManualEntry(true);
    };

    // Update input field value for address
    const handleAddressChange = (event) => {
        setInputAddress(event.target.value);
    };

    // When a place is selected from the autocomplete, update user location and fetch supermarkets
    const handlePlaceSelect = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const latitude = place.geometry.location.lat();
                const longitude = place.geometry.location.lng();
                console.log("Selected place:", { latitude, longitude });
                setUserLocation({ latitude, longitude });
                fetchNearbySupers(latitude, longitude);
                setManualEntry(false);
            } else {
                console.error("Selected place has no geometry");
            }
        } else {
            console.error("Autocomplete instance is not initialized");
        }
    };

    // Save the autocomplete instance to state
    const onLoad = (autocompleteInstance) => {
        console.log("Autocomplete loaded");
        setAutocomplete(autocompleteInstance);
    };

    return (
        <div className="p-5 flex flex-col items-center">
            <div className="w-full max-w-4xl mt-5 bg-slate-50 rounded-lg shadow-md">
                <CardHeader>
                    <CardTitle>Select Your Location</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Display loading, error, or map and list of supermarkets */}
                    {isLoading ? (
                        <div className="text-center" role="status" aria-live="polite">
                            Loading...
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center" role="alert">
                            {error}
                        </div>
                    ) : (
                        <>
                            <div id="map container" className="w-full h-55-vh mb-5 shadow-md">
                                <Map
                                    center={
                                        userLocation
                                            ? {
                                                  lat: userLocation.latitude,
                                                  lng: userLocation.longitude,
                                              }
                                            : { lat: 41.9028, lng: 12.4964 } // Default to Rome, Italy
                                    }
                                    zoom={13}
                                    onDragEnd={(map) => {
                                        const center = map.getCenter();
                                        console.log("Map dragged. New center:", {
                                            lat: center.lat(),
                                            lng: center.lng(),
                                        });
                                        fetchNearbySupers(center.lat(), center.lng());
                                    }}
                                >
                                    {nearbySupers.map((supermarket) => (
                                        <Marker
                                            key={supermarket.id}
                                            position={{
                                                lat: supermarket.latitude,
                                                lng: supermarket.longitude,
                                            }}
                                            onClick={() => handleSupermartClick(supermarket.id)}
                                            aria-label={`Location of ${supermarket.name}`}
                                        />
                                    ))}
                                </Map>
                            </div>
                            <div className="flex flex-col w-full">
                                {nearbySupers.map((supermarket) => (
                                    <div
                                        key={supermarket.id}
                                        className="p-3 mb-2 border border-gray-300 rounded-md cursor-pointer transition-colors hover:bg-gray-100"
                                        onClick={() => handleSupermartClick(supermarket.id)}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Select supermarket ${supermarket.name}`}
                                    >
                                        <div className="font-bold">
                                            {supermarket.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {supermarket.address}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {manualEntry ? (
                                <div className="mt-5">
                                    <Autocomplete
                                        onLoad={onLoad}
                                        onPlaceChanged={handlePlaceSelect}
                                        options={{
                                            fields: ["geometry", "formatted_address"],
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={inputAddress}
                                                onChange={handleAddressChange}
                                                placeholder="Enter Location here"
                                                className="p-2 border border-gray-300 rounded-md w-full"
                                            />
                                            <Button
                                                onClick={handlePlaceSelect}
                                                aria-label="Confirm location"
                                            >
                                                ➡️
                                            </Button>
                                        </div>
                                    </Autocomplete>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleManualLocationEntry}
                                    className="mt-5 bg-blue-500 text-white"
                                >
                                    Enter Location Manually
                                </Button>
                            )}
                        </>
                    )}
                </CardContent>
            </div>
        </div>
    );
};

export default LocationPage;