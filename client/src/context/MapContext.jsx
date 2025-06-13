import { useState } from "react";
import { createContext } from "react";

const MapContext=createContext()

export const MapProvider=({children})=>{
    const [destLocation,setDestLocation]=useState(null)
    return(
        <MapContext.Provider value={{destLocation,setDestLocation}}>
            {children}
        </MapContext.Provider>
    )
}

export default MapContext;