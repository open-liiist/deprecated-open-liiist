
'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AiOutlineDown } from "react-icons/ai";
import { reverseGeocode, getUserLocation } from '../map/Map';

export default function SetLocationLink() {
  const pathname = usePathname();
  const [currentAddress, setCurrentAddres] = useState("set location");

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const userLocation = await getUserLocation();
        const address = await reverseGeocode(userLocation.latitude, userLocation.longitude);
        setCurrentAddres(address);
      }
      catch (error){
        console.error("Failed to get address: ", error);
      }
    };
    fetchAddress();
  }, []);

  return (
    <Link href={pathname === '/en/position' ? '/home' : '/position'} className="flex items-center">
      <span className="ml-2 text-xl font-semibold text-gray-900">
		{pathname === '/en/position' ? "home" : (<div className='flex'><AiOutlineDown/>{currentAddress}</div>)}
	  </span>
    </Link>
  );
}

