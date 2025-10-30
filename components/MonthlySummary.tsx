import React from 'react';
import { CalendarDaysIcon } from './Icons';

interface MonthlyCardProps {
    month: string;
    year: number;
    obras: number;
    value: string;
    color: string;
}

const MonthlyCard: React.FC<MonthlyCardProps> = ({ month, year, obras, value, color }) => {
    const isFebruary = month.toLowerCase() === 'fevereiro';
    const specialBorderStyle = isFebruary ? 'ring-2 ring-blue-500' : '';

    return (
        <div className={`bg-white rounded-lg shadow p-3 flex flex-col border-l-4 ${color} ${specialBorderStyle}`}>
            <div className="flex items-center space-x-2 text-gray-500 text-xs font-semibold">
                <CalendarDaysIcon className="w-4 h-4 text-sky-600" />
                <span>{month.toUpperCase()} {year}</span>
            </div>
            <div className="text-center my-2 flex-grow">
                <p className="text-3xl font-bold text-gray-800">{obras}</p>
                <p className="text-gray-500 text-xs">OBRAS</p>
            </div>
            <div className="bg-gray-100 text-center rounded p-1.5 mt-1">
                <p className="text-gray-700 font-semibold text-sm">{value}</p>
            </div>
        </div>
    );
}

interface MonthlySummaryProps {
    year: number;
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ year }) => {
    const monthlyData = [
        { month: 'Janeiro', obras: 0, value: 'R$ 0', color: 'border-blue-500' },
        { month: 'Fevereiro', obras: 3, value: 'R$ 11.593', color: 'border-purple-500' },
        { month: 'Março', obras: 5, value: 'R$ 7.782', color: 'border-teal-400' },
        { month: 'Abril', obras: 7, value: 'R$ 19.948', color: 'border-orange-400' },
        { month: 'Maio', obras: 9, value: 'R$ 7.045', color: 'border-orange-400' },
        { month: 'Junho', obras: 10, value: 'R$ 83.426', color: 'border-red-500' },
        { month: 'Julho', obras: 11, value: 'R$ 36.439', color: 'border-green-500' },
        { month: 'Agosto', obras: 9, value: 'R$ 528.683', color: 'border-green-500' },
        { month: 'Setembro', obras: 7, value: 'R$ 1.824.458', color: 'border-purple-500' },
        { month: 'Outubro', obras: 5, value: 'R$ 752.703', color: 'border-red-500' },
        { month: 'Novembro', obras: 3, value: 'R$ 2.735.555', color: 'border-red-500' },
        { month: 'Dezembro', obras: 2, value: 'R$ 0', color: 'border-gray-700' },
    ];
    
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {monthlyData.map(data => (
                    <MonthlyCard key={data.month} {...data} year={year} />
                ))}
            </div>
        </div>
    )
}

export default MonthlySummary;
