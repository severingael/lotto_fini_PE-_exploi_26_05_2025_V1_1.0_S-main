import React from 'react';
import WelcomeHero from '../components/home/WelcomeHero';
import FootballMatches from '../components/home/FootballMatches';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <WelcomeHero />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <FootballMatches />
      </div>
    </div>
  );
}