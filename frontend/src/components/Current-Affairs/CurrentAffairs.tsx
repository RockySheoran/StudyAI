'use client';
import { fetchCurrentAffairs } from '@/Actions/Current-Affairs/CurrentAffair-Api';
import { AffairType, CurrentAffair } from '@/types/Current-Affairs/CurrentAffair-types';
import React, { useState } from 'react';
import ArticleModal from './ArticleModal';

const CurrentAffairs: React.FC = () => {
  const [type, setType] = useState<AffairType>('random');
  const [customCategory, setCustomCategory] = useState('');
  const [affair, setAffair] = useState<CurrentAffair | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const category = type === 'custom' ? customCategory : undefined;
      const result = await fetchCurrentAffairs(type, category);
      setAffair(result);
    } catch (err) {
      setError('Failed to fetch current affairs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">Current Affairs</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Select Type</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={type === 'random'}
                onChange={() => setType('random')}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Random</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={type === 'custom'}
                onChange={() => setType('custom')}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Custom</span>
            </label>
          </div>
        </div>
        
        {type === 'custom' && (
          <div className="mb-6">
            <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
              Enter Category
            </label>
            <input
              type="text"
              id="category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Technology, Politics, Sports"
              required
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Current Affairs'}
        </button>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {affair && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{affair.title}</h2>
          <p className="text-gray-600 mb-6">{affair.summary}</p>
          <button
            onClick={openModal}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Show More
          </button>
        </div>
      )}
      
      {showModal && affair && (
        <ArticleModal affair={affair} onClose={closeModal} />
      )}
    </div>
  );
};

export default CurrentAffairs;