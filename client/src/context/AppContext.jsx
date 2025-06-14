import { useState } from "react";
import { createContext } from "react";

const MapContext=createContext()

export const MapProvider=({children})=>{
    const [destLocation,setDestLocation]=useState(null);
    const apiUrl = "http://localhost:8001";
    return(
        <MapContext.Provider value={{destLocation,setDestLocation,apiUrl}}>
            {children}
        </MapContext.Provider>
    )
}

export default MapContext;