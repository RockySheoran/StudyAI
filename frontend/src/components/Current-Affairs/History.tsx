'use client';
import React, { useState, useEffect } from 'react';

import ArticleModal from './ArticleModal';
import { CurrentAffair } from '@/types/Current-Affairs/CurrentAffair-types';
import { fetchHistory } from '@/Actions/Current-Affairs/CurrentAffair-Api';

const History: React.FC = () => {
  const [affairs, setAffairs] = useState<CurrentAffair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAffair, setSelectedAffair] = useState<CurrentAffair | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await fetchHistory();
        setAffairs(history);
      } catch (err) {
        setError('Failed to load history. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const openModal = (affair: CurrentAffair) => {
    setSelectedAffair(affair);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAffair(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">History</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {affairs.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No history available yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {affairs.map((affair) => (
            <div key={affair._id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{affair.title}</h2>
              <p className="text-gray-600 mb-4">{affair.summary}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(affair.createdAt!).toLocaleDateString()} • {affair.category}
                </span>
                <button
                  onClick={() => openModal(affair)}
                  className="bg-blue-500 text-white py-1 px-3 rounded-md text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Read Full Article
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showModal && selectedAffair && (
        <ArticleModal affair={selectedAffair} onClose={closeModal} />
      )}
    </div>
  );
};

export default History;