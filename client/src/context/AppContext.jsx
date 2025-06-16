import axios from "axios";
import { useEffect, useState } from "react";
import { createContext } from "react";

const MapContext=createContext()

export const MapProvider=({children})=>{
    const [destLocation,setDestLocation]=useState(null);
    const apiUrl = "http://192.168.1.80:8001";
    const [user,setUser] = useState(null);
    const fetchUser = async ()=>{
        const token = localStorage.getItem('token');
        if(token){
            const response= await axios.get(`${apiUrl}/api/auth/me`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            setUser(response.data);
        }
        
    }
    useEffect(()=>{
        fetchUser();
    },[])
    return(
        <MapContext.Provider value={{destLocation,setDestLocation,apiUrl,user,setUser}}>
            {children}
        </MapContext.Provider>
    )
}

export default MapContext;