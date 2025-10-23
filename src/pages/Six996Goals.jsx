import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSix996Goals, saveSix996Goals } from '../utils/api';
import { getWeekDates, formatWeekEndingDate, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

function Six996Goals() {
  const { user } = useAuth();
  const { weekStart, weekEnd } = getWeekDates();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    physicalGoal: '',
    mentalGoal: '',
    spiritualGoal: '',
    relationalGoal: '',
    financialGoal: '',
    outsideWorkActivities: '',
    duringWorkActivities: '',
    visualizationExercise: '',
    oldHabit: '',
    newHabit: '',
    completed: false,
    progressNotes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const goals = await getSix996Goals(user.id);
      if (goals) {
        setFormData({
          physicalGoal: goals.physical_goal || '',
          mentalGoal: goals.mental_goal || '',
          spiritualGoal: goals.spiritual_goal || '',
          relationalGoal: goals.relational_goal || '',
          financialGoal: goals.financial_goal || '',
          outsideWorkActivities: goals.outside_work_activities || '',
          duringWorkActivities: goals.during_work_activities || '',
          visualizationExercise: goals.visualization_exercise || '',
          oldHabit: goals.old_habit || '',
          newHabit: goals.new_habit || '',
          completed: goals.completed || false,
          progressNotes: goals.progress_notes || '',
        });
      }
    } catch (error) {
      console.error('Failed to load 6996 goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await saveSix996Goals(user.id, {
        weekStartDate: formatDate(weekStart),
        physicalGoal: formData.physicalGoal,
        mentalGoal: formData.mentalGoal,
        spiritualGoal: formData.spiritualGoal,
        relationalGoal: formData.relationalGoal,
        financialGoal: formData.financialGoal,
        outsideWorkActivities: formData.outsideWorkActivities,
        duringWorkActivities: formData.duringWorkActivities,
        visualizationExercise: formData.visualizationExercise,
        oldHabit: formData.oldHabit,
        newHabit: formData.newHabit,
        completed: formData.completed,
        progressNotes: formData.progressNotes,
      });

      alert('6996 Goals saved successfully!');
    } catch (error) {
      console.error('Failed to save 6996 goals:', error);
      alert('Failed to save 6996 goals. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <h1 className="text-3xl font-bold mb-2">6996 Framework</h1>
        <p className="opacity-90">
          5-Dimensional Goal Setting for {formatWeekEndingDate(weekEnd)}
        </p>
      </div>

      {/* Framework Explanation */}
      <div className="card bg-blue-50">
        <h2 className="text-lg font-bold mb-2">About the 6996 Framework</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Set goals across 5 life dimensions: Physical, Mental, Spiritual, Relational, Financial</li>
          <li>• Plan activities from 6-9 (outside work) that support your goals</li>
          <li>• Plan activities from 9-6 (during work) that align with your goals</li>
          <li>• Replace old habits with new, productive ones</li>
          <li>• Visualize your success to make it real</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* 5 Dimensional Goals */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">5 Dimensional Goals</h2>
          <div className="space-y-4">
            <div>
              <label className="label flex items-center">
                <span className="text-xl mr-2">💪</span>
                Physical Goal
              </label>
              <textarea
                name="physicalGoal"
                className="input"
                rows="2"
                value={formData.physicalGoal}
                onChange={handleChange}
                placeholder="e.g., Exercise 5 days this week, sleep 8 hours/night"
              />
            </div>

            <div>
              <label className="label flex items-center">
                <span className="text-xl mr-2">🧠</span>
                Mental Goal
              </label>
              <textarea
                name="mentalGoal"
                className="input"
                rows="2"
                value={formData.mentalGoal}
                onChange={handleChange}
                placeholder="e.g., Read for 30 minutes daily, learn a new skill"
              />
            </div>

            <div>
              <label className="label flex items-center">
                <span className="text-xl mr-2">🙏</span>
                Spiritual Goal
              </label>
              <textarea
                name="spiritualGoal"
                className="input"
                rows="2"
                value={formData.spiritualGoal}
                onChange={handleChange}
                placeholder="e.g., Meditate 10 minutes daily, practice gratitude"
              />
            </div>

            <div>
              <label className="label flex items-center">
                <span className="text-xl mr-2">❤️</span>
                Relational Goal
              </label>
              <textarea
                name="relationalGoal"
                className="input"
                rows="2"
                value={formData.relationalGoal}
                onChange={handleChange}
                placeholder="e.g., Have 3 quality conversations with family, connect with a friend"
              />
            </div>

            <div>
              <label className="label flex items-center">
                <span className="text-xl mr-2">💰</span>
                Financial Goal
              </label>
              <textarea
                name="financialGoal"
                className="input"
                rows="2"
                value={formData.financialGoal}
                onChange={handleChange}
                placeholder="e.g., Close 20 deals, earn $80k this week, save $500"
              />
            </div>
          </div>
        </div>

        {/* 6-9 Outside Work */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">6-9 (Outside Work Hours)</h2>
          <label className="label">
            What activities will you do from 6am-9am (before work) to support your goals?
          </label>
          <textarea
            name="outsideWorkActivities"
            className="input"
            rows="4"
            value={formData.outsideWorkActivities}
            onChange={handleChange}
            placeholder="e.g., Morning workout 6:30-7:30, breakfast with family, review goals, visualization exercise"
          />
        </div>

        {/* 9-6 During Work */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">9-6 (During Work Hours)</h2>
          <label className="label">
            What will you focus on from 9am-6pm (during work) to achieve your goals?
          </label>
          <textarea
            name="duringWorkActivities"
            className="input"
            rows="4"
            value={formData.duringWorkActivities}
            onChange={handleChange}
            placeholder="e.g., 80+ contacts daily, perfect presentation delivery, maintain high energy, close with confidence"
          />
        </div>

        {/* Visualization */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Visualization Exercise</h2>
          <label className="label">
            Describe yourself achieving these goals. What does success look, feel, and sound like?
          </label>
          <textarea
            name="visualizationExercise"
            className="input"
            rows="5"
            value={formData.visualizationExercise}
            onChange={handleChange}
            placeholder="I see myself... I feel... I hear... I am..."
          />
        </div>

        {/* Habit Replacement */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Habit Replacement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Old Habit to Break</label>
              <textarea
                name="oldHabit"
                className="input"
                rows="3"
                value={formData.oldHabit}
                onChange={handleChange}
                placeholder="e.g., Hitting snooze, checking phone first thing, eating fast food"
              />
            </div>
            <div>
              <label className="label">New Habit to Build</label>
              <textarea
                name="newHabit"
                className="input"
                rows="3"
                value={formData.newHabit}
                onChange={handleChange}
                placeholder="e.g., Wake at 6am immediately, morning routine, meal prep"
              />
            </div>
          </div>
        </div>

        {/* Progress Notes */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Progress Tracking</h2>
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="completed"
                checked={formData.completed}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span className="font-medium">Mark this week's goals as completed</span>
            </label>
          </div>
          <label className="label">Progress Notes</label>
          <textarea
            name="progressNotes"
            className="input"
            rows="4"
            value={formData.progressNotes}
            onChange={handleChange}
            placeholder="Track your progress throughout the week..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save 6996 Goals'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Six996Goals;
