
import React from 'react';
import type { SummaryData } from '../types';


const SummaryCard: React.FC<SummaryData> = ({ title, count, value, color, icon: Icon }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 flex flex-col justify-between border-l-4 ${color}`}>
      <div className="flex items-center space-x-2 text-gray-600 mb-2">
        <Icon className="w-5 h-5" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="text-center my-2">
        <p className="text-3xl font-bold text-gray-800">{count}</p>
        <p className="text-gray-500 text-sm">Solicitações</p>
      </div>
      <div className="bg-gray-100 text-center rounded p-2 mt-2">
        <p className="text-gray-700 font-semibold text-sm">{value}</p>
      </div>
    </div>
  );
};

export default SummaryCard;
