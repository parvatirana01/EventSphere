import React from 'react';

const Footer: React.FC = () => (
  <footer className="w-full bg-primary-100 text-neutral-500 text-center py-4 mt-8 rounded-t-2xl shadow-soft">
    &copy; {new Date().getFullYear()} EventBooking. All rights reserved.
  </footer>
);

export default Footer;