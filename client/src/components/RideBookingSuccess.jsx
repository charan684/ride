import React, { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";

// Adjust NAVBAR_HEIGHT if your navbar is a different height
// const NAVBAR_HEIGHT = 64; // in pixels

export default function RideBookingSuccessBelowNavbar() {
  const confettiFired = useRef(false);
const navigate = useNavigate();
  useEffect(() => {
    if (!confettiFired.current) {
      confettiFired.current = true;
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#00e676", "#2196f3", "#ffeb3b", "#f50057"],
      });
    }
   setTimeout(()=>{
    navigate("/my-rides");
   },3000);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-8"
      style={{
        minHeight: `calc(100vh - ${10}vh)`,
        
      }}
    >
      <div className="animate-bounce">
        <CheckCircle2 className="w-28 h-28 text-green-500 drop-shadow-lg" />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold text-green-700 text-center">
        Your ride booking is successful!
      </h1>
      <p className="mt-3 text-lg text-gray-700 text-center max-w-md">
        Sit back and relax. Your driver will arrive soon.
      </p>
    </div>
  );
}
