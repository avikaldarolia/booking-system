import { Bell, Search, User } from "lucide-react";

const Header = () => {
	return (
		<header className="bg-white shadow-sm z-10">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Search className="h-5 w-5 text-gray-400" />
							</div>
							<input
								type="text"
								placeholder="Search..."
								className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							/>
						</div>
					</div>

					<div className="flex items-center">
						<button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
							<Bell className="h-6 w-6" />
						</button>

						<div className="ml-3 relative">
							<div className="flex items-center">
								<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
									<User className="h-5 w-5 text-gray-500" />
								</div>
								<span className="ml-2 text-gray-700">Manager</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
