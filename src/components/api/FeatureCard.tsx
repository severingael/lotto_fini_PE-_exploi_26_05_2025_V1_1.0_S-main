import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
}

export default function FeatureCard({ title, description, icon: Icon, path, color }: FeatureCardProps) {
  return (
    <Link
      to={path}
      className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: `var(--${color}-100)` }}>
          <Icon className="w-6 h-6" style={{ color: `var(--${color}-600)` }} />
        </div>
        <h3 className="font-medium text-lg">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}