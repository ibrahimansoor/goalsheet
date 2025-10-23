import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDailyPerformance, getTodayCoaching, getWeeklyGoals } from '../utils/api';
import { getWeekDates, formatReadableDate, formatCurrency, getWeekDays, isToday } from '../utils/helpers';
import CoachingCard from '../components/CoachingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function RepDashboard() {
  const { user } = useAuth();
  const [weeklyPerformance, setWeeklyPerformance] = useState([]);
  const [todayCoaching, setTodayCoaching] = useState(null);
  const [weeklyGoals, setWeeklyGoals] = useState(null);
  const [loading, setLoading] = useState(true);

  const { weekStart, weekEnd } = getWeekDates();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [performance, coaching, goals] = await Promise.all([
        getDailyPerformance(user.id, {
          startDate: weekStart.toISOString().split('T')[0],
          endDate: weekEnd.toISOString().split('T')[0],
        }),
        getTodayCoaching(user.id),
        getWeeklyGoals(user.id),
      ]);

      setWeeklyPerformance(performance);
      setTodayCoaching(coaching);
      setWeeklyGoals(goals);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Calculate weekly totals
  const weeklyTotals = weeklyPerformance.reduce(
    (acc, day) => ({
      contacts: acc.contacts + (day.contacts || 0),
      presentations: acc.presentations + (day.presentations || 0),
      closes: acc.closes + (day.closes || 0),
      revenue: acc.revenue + parseFloat(day.revenue || 0),
    }),
    { contacts: 0, presentations: 0, closes: 0, revenue: 0 }
  );

  // Prepare chart data
  const weekDays = getWeekDays(weekStart);
  const chartData = weekDays.map((day) => {
    const performance = weeklyPerformance.find((p) => p.date === day.date);
    return {
      name: day.dayName,
      contacts: performance?.contacts || 0,
      presentations: performance?.presentations || 0,
      closes: performance?.closes || 0,
    };
  });

  // Today's performance
  const today = weeklyPerformance.find((p) => isToday(p.date));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">Week Ending: {formatReadableDate(weekEnd)}</p>
        </div>
        <Link to="/daily-entry" className="btn-primary">
          Submit Today's Numbers
        </Link>
      </div>

      {/* Coaching Card */}
      {todayCoaching && (
        <CoachingCard
          coaching={todayCoaching}
          onAcknowledge={() => {
            // Acknowledge coaching logic
          }}
        />
      )}

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-sm opacity-90">Contacts</div>
          <div className="text-3xl font-bold mt-2">{weeklyTotals.contacts}</div>
          {weeklyGoals && (
            <div className="text-sm mt-2 opacity-90">
              Goal: {weeklyGoals.target_contacts}
            </div>
          )}
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-sm opacity-90">Presentations</div>
          <div className="text-3xl font-bold mt-2">{weeklyTotals.presentations}</div>
          {weeklyGoals && (
            <div className="text-sm mt-2 opacity-90">
              Goal: {weeklyGoals.target_presentations}
            </div>
          )}
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-sm opacity-90">Closes</div>
          <div className="text-3xl font-bold mt-2">{weeklyTotals.closes}</div>
          {weeklyGoals && (
            <div className="text-sm mt-2 opacity-90">
              Goal: {weeklyGoals.target_closes}
            </div>
          )}
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="text-sm opacity-90">Revenue</div>
          <div className="text-3xl font-bold mt-2">{formatCurrency(weeklyTotals.revenue)}</div>
          {weeklyGoals && (
            <div className="text-sm mt-2 opacity-90">
              Goal: {formatCurrency(weeklyGoals.target_revenue)}
            </div>
          )}
        </div>
      </div>

      {/* Today's Performance */}
      {today && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Today's Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-sm text-gray-500">Contacts</div>
              <div className="text-2xl font-bold">{today.contacts}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Presentations</div>
              <div className="text-2xl font-bold">{today.presentations}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Credit Checks</div>
              <div className="text-2xl font-bold">{today.credit_checks}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Closes</div>
              <div className="text-2xl font-bold">{today.closes}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Revenue</div>
              <div className="text-2xl font-bold">{formatCurrency(today.revenue)}</div>
            </div>
          </div>

          {today.ratios && (
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Contact → Presentation</div>
                <div className="text-xl font-bold">
                  {today.ratios.contactToPresentationRatio || '-'}:1
                </div>
                <div className="text-xs text-gray-400">Target: 7:1</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Presentation → Credit</div>
                <div className="text-xl font-bold">
                  {today.ratios.presentationToCreditRatio || '-'}:1
                </div>
                <div className="text-xs text-gray-400">Target: 2:1</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Close Rate</div>
                <div className="text-xl font-bold">{today.ratios.closeRate || '-'}%</div>
                <div className="text-xs text-gray-400">Target: 80%</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weekly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Weekly Activity Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="contacts" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="presentations" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Weekly Closes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="closes" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/weekly-goals"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <h3 className="font-bold text-lg mb-2">Weekly Goals</h3>
          <p className="text-sm text-gray-600">
            Set and track your weekly targets and stretch goals
          </p>
        </Link>

        <Link
          to="/six996-goals"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <h3 className="font-bold text-lg mb-2">6996 Framework</h3>
          <p className="text-sm text-gray-600">
            Plan your 5-dimensional goals and activities
          </p>
        </Link>

        <div className="card bg-gray-50">
          <h3 className="font-bold text-lg mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600">
            Review your coaching feedback or reach out to your manager
          </p>
        </div>
      </div>
    </div>
  );
}

export default RepDashboard;
