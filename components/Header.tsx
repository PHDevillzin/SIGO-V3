
import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
    </div>
  );
};

export default Header;
