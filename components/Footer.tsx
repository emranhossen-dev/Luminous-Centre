const Footer = () => {
    return (
        <footer className="bg-brand-deep pt-20 pb-10 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <img src="https://i.ibb.co.com/d063XCPx/logo.jpg" alt="Logo" className="w-10 h-10 rounded-full" />
                        <span className="text-xl font-bold tracking-widest">LUMINOUS</span>
                    </div>
                    <p className="text-gray-400 max-w-sm leading-relaxed mb-6">
                        The leading skill development training center dedicated to building the future of the digital workforce through practical, hands-on learning.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-sm">Programs</h4>
                    <ul className="text-gray-400 space-y-4 text-sm">
                        <li className="hover:text-brand-primary cursor-pointer transition">Recorded Sessions</li>
                        <li className="hover:text-brand-primary cursor-pointer transition">Live Workshops</li>
                        <li className="hover:text-brand-primary cursor-pointer transition">Campus Training</li>
                        <li className="hover:text-brand-primary cursor-pointer transition">Free Assets</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-sm">Support</h4>
                    <ul className="text-gray-400 space-y-4 text-sm">
                        <li className="hover:text-brand-primary cursor-pointer transition">Contact Us</li>
                        <li className="hover:text-brand-primary cursor-pointer transition">Privacy Policy</li>
                        <li className="hover:text-brand-primary cursor-pointer transition">Terms of Service</li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 text-center">
                <p className="text-gray-600 text-xs tracking-widest">
                    © 2026 LUMINOUS SKILL DEVELOPMENT TRAINING CENTER. ALL RIGHTS RESERVED.
                </p>
            </div>
        </footer>
    );
};

export default Footer;