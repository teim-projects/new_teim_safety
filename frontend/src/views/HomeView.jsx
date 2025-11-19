// src/views/HomeView.jsx
import React from 'react';
const Card = ({ title, description, image, type, onSelectCheck }) => (
  <button
    onClick={() => onSelectCheck(type)}
    className="w-full max-w-2xl mx-auto transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl rounded-xl overflow-hidden shadow-lg bg-white"
  >
    <div className="flex flex-col md:flex-row h-full border-2 border-indigo-700 rounded-xl">
      {/* Image Section */}
      <div className="md:w-1/3 w-full bg-white flex items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-48 md:h-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/200x150/e0e7ff/3730a3?text=${type}`;
          }}
        />
      </div>

      {/* Text Section */}
      <div className="md:w-2/3 w-full bg-indigo-700 text-white p-6 flex flex-col justify-center items-center">
        <h3 className="text-2xl font-bold tracking-wider text-center">
          {title}
        </h3>
      </div>
    </div>
  </button>
);

/**
 * Home Page View
 */
const HomeView = ({ onSelectCheck }) => {
  return (
    <div className="pt-10 flex flex-col items-center space-y-10">
      <Card
        title="Machine Quality Check"
        type="Machine"
        image="https://placehold.co/400x300/e0e7ff/3730a3?text=Machine+Image"
        onSelectCheck={onSelectCheck}
      />
      <Card
        title="PPE Checking"
        type="PPE"
        image="https://placehold.co/400x300/e0e7ff/3730a3?text=PPE+Image"
        onSelectCheck={onSelectCheck}
      />
    </div>
  );
};

export default HomeView;
