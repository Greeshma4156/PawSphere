import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, ShieldAlert } from 'lucide-react';

export default function PremiumFooter() {
  return (
    <footer className="mt-10 py-12 px-6 border-t border-lavender/10">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender/10 border border-lavender/20">
              <ShieldAlert className="w-4 h-4 text-lavender" />
              <span className="text-xs font-extrabold tracking-widest uppercase text-lavender">PawSphere</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
              A premium rescue coordination ecosystem for citizens, volunteers, shelters, and sponsors—built for fast, transparent action.
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2 bg-beige/20 border border-lavender/10 rounded-2xl px-3 py-2">
                <Phone className="w-3.5 h-3.5 text-peach" />
                <span className="font-bold text-gray-600 dark:text-gray-200">Emergency Hotline</span>
                <span className="text-gray-500 dark:text-gray-400">+1 (555) 9000</span>
              </div>
              <div className="flex items-center gap-2 bg-beige/20 border border-lavender/10 rounded-2xl px-3 py-2">
                <Mail className="w-3.5 h-3.5 text-lavender" />
                <span className="font-bold text-gray-600 dark:text-gray-200">Support</span>
                <span className="text-gray-500 dark:text-gray-400">help@pawsphere.org</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Quick Links</div>
                <div className="mt-3 space-y-2">
                  <Link to="/map" className="block text-sm text-gray-600 dark:text-gray-200 hover:text-lavender">Live Map</Link>
                  <Link to="/donations" className="block text-sm text-gray-600 dark:text-gray-200 hover:text-lavender">Donations</Link>
                  <Link to="/dashboard/citizen" className="block text-sm text-gray-600 dark:text-gray-200 hover:text-lavender">Citizen Dashboard</Link>
                </div>
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Ecosystem</div>
                <div className="mt-3 space-y-2">
                  <Link to="/dashboard/volunteer" className="block text-sm text-gray-600 dark:text-gray-200 hover:text-lavender">Volunteer Console</Link>
                  <Link to="/shelter" className="block text-sm text-gray-600 dark:text-gray-200 hover:text-lavender">Shelter Intake</Link>
                  <a href="/" className="block text-sm text-gray-600 dark:text-gray-200 hover:text-lavender">AI Scan Preview</a>
                </div>
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Community</div>
                <div className="mt-3 space-y-2">
                  <a href="/signup" className="block text-sm text-gray-600 dark:text-gray-200 hover:text-lavender">Volunteer Signup</a>
                  <a href="#" className="block text-sm text-gray-600 dark:text-gray-200 hover:text-lavender">Newsletter</a>
                  <a href="#" className="block text-sm text-gray-600 dark:text-gray-200 hover:text-lavender">Social</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} PawSphere Ecosystem • Pastel Glass Rescue Platform • Built for stray welfare.
        </div>
      </div>
    </footer>
  );
}

