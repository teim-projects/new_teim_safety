// src/views/DashboardView.jsx

import React from 'react';

/**
 * Dashboard View (Design a2.jpg)
 */
const DashboardView = () => {
  const StatCircle = ({ percent, title, color }) => (
    <div className="flex flex-col items-center p-4">
      <div className={`relative w-28 h-28 flex items-center justify-center rounded-full border-4 ${color}`}>
        <span className="text-xl font-bold text-gray-800">{percent}</span>
      </div>
      <p className="mt-2 text-sm text-gray-500">{title}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h3 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2">Statistic Graphs</h3>

      {/* Metric Circles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCircle percent="70%" title="02" color="border-blue-500 text-blue-700" />
        <StatCircle percent="50%" title="01" color="border-blue-500 text-blue-700" />
        <StatCircle percent="80%" title="03" color="border-blue-500 text-blue-700" />
        <StatCircle percent="100%" title="04" color="border-blue-500 text-blue-700" />
      </div>

      {/* Placeholder for Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart Placeholder */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Statistic Graph (Compliance Breakdown)</h4>
          <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg">
            {/* Simple Pie Chart Representation */}
            <div className="w-40 h-40 rounded-full bg-conic-gradient" style={{
              backgroundImage: 'conic-gradient(rgb(30, 64, 175) 0% 50%, rgb(59, 130, 246) 50% 75%, rgb(147, 197, 253) 75% 100%)'
            }}>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg">
                <span className="text-xs text-gray-800">01 (50%)</span>
              </div>
            </div>
          </div>
          <div className='flex justify-around mt-4 text-sm'>
            <span className='text-blue-900'>01</span>
            <span className='text-blue-600'>02</span>
            <span className='text-blue-300'>03</span>
          </div>
        </div>

        {/* Bar Chart Placeholder */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Statistic Graph (Annual Trend)</h4>
          <div className="h-64 bg-gray-100 flex items-end p-2 rounded-lg">
            {/* Simple Bar Chart Representation */}
            <div className="flex w-full h-full items-end justify-between space-x-1">
              {[40, 60, 80, 50, 30, 70, 90, 95, 85, 75].map((h, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-3 md:w-4 bg-indigo-700 rounded-t-sm transition-all duration-500"
                    style={{ height: `${h}%` }}
                  ></div>
                  <span className='text-xs text-gray-600 mt-1'>{2012 + index}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;