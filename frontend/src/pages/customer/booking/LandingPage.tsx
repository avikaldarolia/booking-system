import Footer from "../../../components/Footer";
import HeroSection from "./HeroSection";
import BookingProcess from "./BookingProcess";
import Services from "../../../data/Services";
import { useAuth } from "../../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoleBasedRenderHash } from "../../../utils/utils";

const LandingPage = () => {
	const { user } = useAuth();
	const [isBookingActive, setIsBookingActive] = useState(false);
	const navigate = useNavigate();
	useEffect(() => {
		if (!user) {
			return;
		} else {
			navigate(RoleBasedRenderHash[user.role].route);
		}
	}, [navigate, user]);
	return (
		<div className="min-h-screen w-full flex flex-col bg-gray-200">
			{/* Show Hero Section only if booking is NOT active */}
			{!isBookingActive && <HeroSection onBookNow={() => setIsBookingActive(true)} />}

			{/* Booking Process */}
			{isBookingActive && <BookingProcess services={Services} />}

			{/* Footer */}
			<Footer />
		</div>
	);
};

export default LandingPage;
