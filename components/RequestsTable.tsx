
import React from 'react';
import { SearchIcon, FilterIcon, EyeIcon, InfoIcon } from './Icons';
import { Criticality } from '../types';
import type { Request } from '../types';

const requestsData: Request[] = [
  { id: 1, criticality: Criticality.IMEDIATA, unit: 'CAT Santo An...', description: 'Reforma Gera...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/01/2028', hasInfo: true, expectedValue: '3,5 mi', executingUnit: 'GSO' },
  { id: 2, criticality: Criticality.CRITICA, unit: 'Sede', description: 'Ambientação ...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '03/11/2025', hasInfo: false, expectedValue: '300 mil', executingUnit: 'GSO' },
  { id: 3, criticality: Criticality.CRITICA, unit: 'Sede', description: 'Ambientação ...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '03/11/2025', hasInfo: false, expectedValue: '250 mil', executingUnit: 'GSO' },
  { id: 4, criticality: Criticality.CRITICA, unit: 'Nova Unidade', description: 'Construção de...', status: 'Análise da Sol...', currentLocation: 'GSO', expectedStartDate: '05/01/2026', hasInfo: false, expectedValue: '50 mi', executingUnit: 'GSO' },
];

const CriticalityBadge: React.FC<{ level: Criticality }> = ({ level }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full text-white";
    const styles = {
        [Criticality.IMEDIATA]: "bg-purple-600",
        [Criticality.CRITICA]: "bg-pink-600",
    };
    return <span className={`${baseClasses} ${styles[level]}`}>{level}</span>;
}

const RequestsTable: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div className="relative w-full sm:w-auto sm:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Procurar..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-sky-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-600 transition-colors">
          <FilterIcon className="w-5 h-5" />
          <span>Filtros Avançados</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-white uppercase bg-[#0B1A4E]">
            <tr>
              <th scope="col" className="px-6 py-3">Criticidade</th>
              <th scope="col" className="px-6 py-3">Unidade</th>
              <th scope="col" className="px-6 py-3">Descrição</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Local Atual</th>
              <th scope="col" className="px-6 py-3">Início Esperado</th>
              <th scope="col" className="px-6 py-3">Valor Esperado</th>
              <th scope="col" className="px-6 py-3">Unidade Exec...</th>
              <th scope="col" className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {requestsData.map((request) => (
              <tr key={request.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <CriticalityBadge level={request.criticality} />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{request.unit}</td>
                <td className="px-6 py-4">{request.description}</td>
                <td className="px-6 py-4">{request.status}</td>
                <td className="px-6 py-4">{request.currentLocation}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                        <span>{request.expectedStartDate}</span>
                        {request.hasInfo && <InfoIcon className="w-4 h-4 text-gray-400" />}
                    </div>
                </td>
                <td className="px-6 py-4">{request.expectedValue}</td>
                <td className="px-6 py-4">{request.executingUnit}</td>
                <td className="px-6 py-4 text-center">
                  <button className="bg-sky-500 text-white p-2 rounded-md hover:bg-sky-600 transition-colors">
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestsTable;
