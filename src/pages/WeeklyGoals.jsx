import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeeklyGoals, saveWeeklyGoals, getDailyPerformance } from '../utils/api';
import { getWeekDates, formatWeekEndingDate, formatDate, calculatePercentage } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

function WeeklyGoals() {
  const { user } = useAuth();
  const { weekStart, weekEnd } = getWeekDates();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actuals, setActuals] = useState({ contacts: 0, presentations: 0, closes: 0, revenue: 0 });
  const [formData, setFormData] = useState({
    targetContacts: '',
    targetPresentations: '',
    targetCloses: '',
    targetRevenue: '',
    stretchContacts: '',
    stretchPresentations: '',
    stretchCloses: '',
    stretchRevenue: '',
    wins: '',
    challenges: '',
    learnings: '',
    nextWeekFocus: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [goals, performance] = await Promise.all([
        getWeeklyGoals(user.id),
        getDailyPerformance(user.id, {
          startDate: formatDate(weekStart),
          endDate: formatDate(weekEnd),
        }),
      ]);

      // Calculate actuals from daily performance
      const totals = performance.reduce(
        (acc, day) => ({
          contacts: acc.contacts + (day.contacts || 0),
          presentations: acc.presentations + (day.presentations || 0),
          closes: acc.closes + (day.closes || 0),
          revenue: acc.revenue + parseFloat(day.revenue || 0),
        }),
        { contacts: 0, presentations: 0, closes: 0, revenue: 0 }
      );
      setActuals(totals);

      if (goals) {
        setFormData({
          targetContacts: goals.target_contacts || '',
          targetPresentations: goals.target_presentations || '',
          targetCloses: goals.target_closes || '',
          targetRevenue: goals.target_revenue || '',
          stretchContacts: goals.stretch_contacts || '',
          stretchPresentations: goals.stretch_presentations || '',
          stretchCloses: goals.stretch_closes || '',
          stretchRevenue: goals.stretch_revenue || '',
          wins: goals.wins || '',
          challenges: goals.challenges || '',
          learnings: goals.learnings || '',
          nextWeekFocus: goals.next_week_focus || '',
        });
      }
    } catch (error) {
      console.error('Failed to load weekly goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await saveWeeklyGoals(user.id, {
        weekStartDate: formatDate(weekStart),
        weekEndDate: formatDate(weekEnd),
        targetContacts: parseInt(formData.targetContacts) || 0,
        targetPresentations: parseInt(formData.targetPresentations) || 0,
        targetCloses: parseInt(formData.targetCloses) || 0,
        targetRevenue: parseFloat(formData.targetRevenue) || 0,
        stretchContacts: parseInt(formData.stretchContacts) || 0,
        stretchPresentations: parseInt(formData.stretchPresentations) || 0,
        stretchCloses: parseInt(formData.stretchCloses) || 0,
        stretchRevenue: parseFloat(formData.stretchRevenue) || 0,
        wins: formData.wins,
        challenges: formData.challenges,
        learnings: formData.learnings,
        nextWeekFocus: formData.nextWeekFocus,
      });

      alert('Weekly goals saved successfully!');
    } catch (error) {
      console.error('Failed to save weekly goals:', error);
      alert('Failed to save weekly goals. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold mb-2">Weekly Goals</h1>
        <p className="text-gray-600">{formatWeekEndingDate(weekEnd)}</p>
      </div>

      {/* Current Progress */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
        <h2 className="text-xl font-bold mb-4">This Week's Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-500">Contacts</div>
            <div className="text-2xl font-bold">{actuals.contacts}</div>
            {formData.targetContacts && (
              <div className="text-sm text-gray-600 mt-1">
                {calculatePercentage(actuals.contacts, formData.targetContacts)}% of target
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-500">Presentations</div>
            <div className="text-2xl font-bold">{actuals.presentations}</div>
            {formData.targetPresentations && (
              <div className="text-sm text-gray-600 mt-1">
                {calculatePercentage(actuals.presentations, formData.targetPresentations)}% of target
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-500">Closes</div>
            <div className="text-2xl font-bold">{actuals.closes}</div>
            {formData.targetCloses && (
              <div className="text-sm text-gray-600 mt-1">
                {calculatePercentage(actuals.closes, formData.targetCloses)}% of target
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-500">Revenue</div>
            <div className="text-2xl font-bold">${actuals.revenue.toFixed(0)}</div>
            {formData.targetRevenue && (
              <div className="text-sm text-gray-600 mt-1">
                {calculatePercentage(actuals.revenue, formData.targetRevenue)}% of target
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Goals Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Target Goals */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Target Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Contacts</label>
              <input
                type="number"
                name="targetContacts"
                className="input"
                value={formData.targetContacts}
                onChange={handleChange}
                min="0"
                placeholder="e.g., 400"
              />
            </div>
            <div>
              <label className="label">Presentations</label>
              <input
                type="number"
                name="targetPresentations"
                className="input"
                value={formData.targetPresentations}
                onChange={handleChange}
                min="0"
                placeholder="e.g., 60"
              />
            </div>
            <div>
              <label className="label">Closes</label>
              <input
                type="number"
                name="targetCloses"
                className="input"
                value={formData.targetCloses}
                onChange={handleChange}
                min="0"
                placeholder="e.g., 20"
              />
            </div>
            <div>
              <label className="label">Revenue ($)</label>
              <input
                type="number"
                name="targetRevenue"
                className="input"
                value={formData.targetRevenue}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g., 80000"
              />
            </div>
          </div>
        </div>

        {/* Stretch Goals */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Stretch Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Contacts</label>
              <input
                type="number"
                name="stretchContacts"
                className="input"
                value={formData.stretchContacts}
                onChange={handleChange}
                min="0"
                placeholder="e.g., 500"
              />
            </div>
            <div>
              <label className="label">Presentations</label>
              <input
                type="number"
                name="stretchPresentations"
                className="input"
                value={formData.stretchPresentations}
                onChange={handleChange}
                min="0"
                placeholder="e.g., 75"
              />
            </div>
            <div>
              <label className="label">Closes</label>
              <input
                type="number"
                name="stretchCloses"
                className="input"
                value={formData.stretchCloses}
                onChange={handleChange}
                min="0"
                placeholder="e.g., 25"
              />
            </div>
            <div>
              <label className="label">Revenue ($)</label>
              <input
                type="number"
                name="stretchRevenue"
                className="input"
                value={formData.stretchRevenue}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g., 100000"
              />
            </div>
          </div>
        </div>

        {/* Reflection */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Weekly Reflection</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Wins This Week</label>
              <textarea
                name="wins"
                className="input"
                rows="3"
                value={formData.wins}
                onChange={handleChange}
                placeholder="What went well this week?"
              />
            </div>
            <div>
              <label className="label">Challenges</label>
              <textarea
                name="challenges"
                className="input"
                rows="3"
                value={formData.challenges}
                onChange={handleChange}
                placeholder="What obstacles did you face?"
              />
            </div>
            <div>
              <label className="label">Learnings</label>
              <textarea
                name="learnings"
                className="input"
                rows="3"
                value={formData.learnings}
                onChange={handleChange}
                placeholder="What did you learn this week?"
              />
            </div>
            <div>
              <label className="label">Next Week Focus</label>
              <textarea
                name="nextWeekFocus"
                className="input"
                rows="3"
                value={formData.nextWeekFocus}
                onChange={handleChange}
                placeholder="What will you focus on next week?"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Weekly Goals'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default WeeklyGoals;
