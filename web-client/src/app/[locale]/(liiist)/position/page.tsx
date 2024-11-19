"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import locationStyles from "./styles/LocationSelection.module.css";
import { Map, getUserLocation } from "@/components/map/Map";
import { Marker, Autocomplete } from "@react-google-maps/api";

const LocationSelectionPage = () => {
    const router = useRouter();
    const [userLocation, setUserLocation] = useState(null);
    const [nearbySupers, setNearbySupers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [manualEntry, setManualEntry] = useState(false);
    const [inputAddress, setInputAddress] = useState("");
    const [autocomplete, setAutocomplete] = useState(null);

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const location = await getUserLocation();
                setUserLocation(location);
                fetchNearbySupers(location.latitude, location.longitude);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocation();
    }, []);

    const fetchNearbySupers = async (latitude, longitude) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/nearby-supermarkets?lat=${latitude}&lng=${longitude}`
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setNearbySupers(data.supermarkets);
        } catch (err) {
            setError("Failed to fetch nearby supermarkets");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSupermartClick = (superId) => {
        router.push(`/supermarket/${superId}`);
    };

    const handleManualLocationEntry = () => {
        setManualEntry(true);
    };

    const handleAddressChange = (event) => {
        setInputAddress(event.target.value);
    };

    const handlePlaceSelect = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const latitude = place.geometry.location.lat();
                const longitude = place.geometry.location.lng();
                setUserLocation({ latitude, longitude });
                fetchNearbySupers(latitude, longitude);
                setManualEntry(false);
            }
        }
    };

    const onLoad = (autocompleteInstance) => {
        setAutocomplete(autocompleteInstance);
    };

    return (
        <div className={locationStyles.container}>
            <Card className={locationStyles.card}>
                <CardHeader>
                    <CardTitle>Select Your Location</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div
                            className={locationStyles.loading}
                            role="status"
                            aria-live="polite"
                        >
                            Loading...
                        </div>
                    ) : error ? (
                        <div className={locationStyles.error} role="alert">
                            {error}
                        </div>
                    ) : (
                        <>
                            <div className={locationStyles.mapContainer}>
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
                                        fetchNearbySupers(
                                            center.lat(),
                                            center.lng()
                                        );
                                    }}
                                >
                                    {nearbySupers.map((supermarket) => (
                                        <Marker
                                            key={supermarket.id}
                                            position={{
                                                lat: supermarket.latitude,
                                                lng: supermarket.longitude,
                                            }}
                                            onClick={() =>
                                                handleSupermartClick(
                                                    supermarket.id
                                                )
                                            }
                                            aria-label={`Location of ${supermarket.name}`}
                                        />
                                    ))}
                                </Map>
                            </div>
                            <div className={locationStyles.supermarketList}>
                                 {nearbySupers.map((supermarket) => (
                                    <div
                                        key={supermarket.id}
                                        className={
                                            locationStyles.supermarketItem
                                        }
                                        onClick={() =>
                                            handleSupermartClick(supermarket.id)
                                        }
                                        role="button"
                                        tabIndex={0}
                                        // onKeyPress={(e) => {
                                        //     if (
                                        //         e.key === "Enter" ||
                                        //         e.key === " "
                                        //     ) {
                                        //         handleSupermartClick(
                                        //             supermarket.id,
                                        //         );
                                        //     }
                                        // }}
                                        aria-label={`Select supermarket ${supermarket.name}`}
                                    >
                                        <div
                                            className={
                                                locationStyles.supermarketName
                                            }
                                        >
                                            {supermarket.name}
                                        </div>
                                        <div
                                            className={
                                                locationStyles.supermarketAddress
                                            }
                                        >
                                            {supermarket.address}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {manualEntry ? (
                                <div
                                    className={
                                        locationStyles.manualEntryContainer
                                    }
                                >
                                    <Autocomplete
                                        onLoad={onLoad}
                                        onPlaceChanged={handlePlaceSelect}
                                        options={{
                                            fields: [
                                                "geometry",
                                                "formatted_address",
                                            ],
                                        }}
                                    >
                                        <div
                                            className={
                                                locationStyles.inputContainer
                                            }
                                        >
                                            <input
                                                type="text"
                                                value={inputAddress}
                                                onChange={handleAddressChange}
                                                placeholder="Enter Location here"
                                                className={
                                                    locationStyles.addressInput
                                                }
                                            />
                                            <Button
                                                onClick={handlePlaceSelect}
                                                className={
                                                    locationStyles.confirmButton
                                                }
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
                                    className={locationStyles.manualEntry}
                                >
                                    Enter Location Manually
                                </Button>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LocationSelectionPage;
