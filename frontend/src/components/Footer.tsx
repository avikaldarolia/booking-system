const Footer = () => {
	return (
		<footer className="bg-gray-800 text-white py-16 px-4">
			<div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
				<div>
					<h4 className="text-lg font-semibold mb-4">Contact Us</h4>
					<p className="text-gray-300">123 Style Street</p>
					<p className="text-gray-300">New York, NY 10001</p>
					<p className="text-gray-300">Phone: (555) 123-4567</p>
					<p className="text-gray-300">Email: info@stylesalon.com</p>
				</div>
				<div>
					<h4 className="text-lg font-semibold mb-4">Hours</h4>
					<p className="text-gray-300">Monday - Friday: 9am - 8pm</p>
					<p className="text-gray-300">Saturday: 9am - 6pm</p>
					<p className="text-gray-300">Sunday: 10am - 5pm</p>
				</div>
				<div>
					<h4 className="text-lg font-semibold mb-4">Quick Links</h4>
					<ul className="space-y-2">
						<li>
							<a href="#" className="text-gray-300 hover:text-blue-300 transition-colors">
								Services
							</a>
						</li>
						<li>
							<a href="#" className="text-gray-300 hover:text-blue-300 transition-colors">
								Book Appointment
							</a>
						</li>
						<li>
							<a href="#" className="text-gray-300 hover:text-blue-300 transition-colors">
								Our Stylists
							</a>
						</li>
						<li>
							<a href="#" className="text-gray-300 hover:text-blue-300 transition-colors">
								Gallery
							</a>
						</li>
					</ul>
				</div>
				<div>
					<h4 className="text-lg font-semibold mb-4">Follow Us</h4>
					<div className="flex space-x-4">
						<a href="#" className="text-gray-300 hover:text-blue-300 transition-colors">
							Instagram
						</a>
						<a href="#" className="text-gray-300 hover:text-blue-300 transition-colors">
							Facebook
						</a>
						<a href="#" className="text-gray-300 hover:text-blue-300 transition-colors">
							Twitter
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
