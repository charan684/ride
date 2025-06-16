import React, { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import AppContext from '../../context/AppContext';
import axios from 'axios';
const TrackRide = () => {
    const {id} = useParams();
    const {apiUrl} = useContext(AppContext);
    const getRideDetails = async()=>{
        const response = await axios.get(`${apiUrl}/bookings/ride-details/${id}`);
        console.log(response);
    }
    useEffect(()=>{
        getRideDetails();
    },[])
  return (
    <div>
        Track rider
    </div>
  )
}

export default TrackRide