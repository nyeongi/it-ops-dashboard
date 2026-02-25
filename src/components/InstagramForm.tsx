"use client";

import React, { useState } from 'react';
import { Instagram } from 'lucide-react';

export default function InstagramForm() {
  const [formData, setFormData] = useState({
    followers: 12500,
    likes: 850,
    comments: 120,
    saves: 45,
    reach: 5200,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Normally would save data here
    console.log('Saved Instagram data:', formData);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-pink-100 dark:bg-pink-500/10 rounded-xl text-pink-600 dark:text-pink-400">
          <Instagram size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Instagram Performance</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manual data entry for latest metrics</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Followers</label>
            <input
              type="number"
              name="followers"
              value={formData.followers}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Post Reach</label>
            <input
              type="number"
              name="reach"
              value={formData.reach}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Likes</label>
            <input
              type="number"
              name="likes"
              value={formData.likes}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Comments</label>
            <input
              type="number"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20 active:scale-[0.98]"
        >
          Save Metrics
        </button>
      </form>
    </div>
  );
}
