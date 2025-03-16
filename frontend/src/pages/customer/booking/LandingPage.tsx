import Footer from "../../../components/Footer";
import HeroSection from "./HeroSection";
import BookingProcess from "./BookingProcess";
import Services from "../../../data/Services";
import { useAuth } from "../../../contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RoleBasedRenderHash } from "../../../utils/utils";

const LandingPage = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	useEffect(() => {
		if (!user) {
			return;
		} else {
			navigate(RoleBasedRenderHash[user.role].route);
		}
	}, [navigate, user]);
	return (
		<div className="min-h-screen flex flex-col bg-gray-50">
			{/* Hero Section */}
			<HeroSection />
			{/* Booking Process Component */}
			<BookingProcess services={Services} />
			{/* Footer */}
			<Footer />
		</div>
	);
};

export default LandingPage;
