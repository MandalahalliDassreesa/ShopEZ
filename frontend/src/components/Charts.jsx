import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register all required modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const MonthlySalesChart = ({ salesData = [] }) => {
  // Sort sales data chronologically
  const sortedData = [...salesData].sort((a, b) => {
    if (a._id.year !== b._id.year) return a._id.year - b._id.year;
    return a._id.month - b._id.month;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const data = {
    labels: sortedData.map(item => `${months[item._id.month - 1]} ${item._id.year}`),
    datasets: [
      {
        fill: true,
        label: 'Monthly Revenue ($)',
        data: sortedData.map(item => item.sales),
        borderColor: 'hsl(256, 82%, 56%)',
        backgroundColor: 'rgba(114, 46, 209, 0.15)',
        tension: 0.4,
        pointBackgroundColor: 'hsl(256, 82%, 56%)'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-primary)',
          font: { family: 'Plus Jakarta Sans' }
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'var(--border-color)' },
        ticks: { color: 'var(--text-secondary)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'var(--text-secondary)' }
      }
    }
  };

  return <Line data={data} options={options} />;
};

export const CategoryPerformanceChart = ({ categoryData = [] }) => {
  const data = {
    labels: categoryData.map(item => item._id),
    datasets: [
      {
        label: 'Revenue by Category ($)',
        data: categoryData.map(item => item.revenue),
        backgroundColor: [
          'rgba(114, 46, 209, 0.7)',
          'rgba(280, 75, 60, 0.7)',
          'rgba(38, 92, 50, 0.7)',
          'rgba(174, 100, 25, 0.7)',
          'rgba(220, 100, 35, 0.7)',
          'rgba(45, 100, 25, 0.7)',
          'rgba(256, 82, 56, 0.5)',
          'rgba(0, 150, 136, 0.7)',
          'rgba(233, 30, 99, 0.7)',
          'rgba(156, 39, 176, 0.7)'
        ],
        borderWidth: 1,
        borderColor: 'var(--border-color)'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'var(--text-primary)',
          font: { family: 'Plus Jakarta Sans', size: 11 }
        }
      }
    }
  };

  return <Doughnut data={data} options={options} />;
};

export const CustomerGrowthChart = ({ growthData = [] }) => {
  const sortedData = [...growthData].sort((a, b) => {
    if (a._id.year !== b._id.year) return a._id.year - b._id.year;
    return a._id.month - b._id.month;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const data = {
    labels: sortedData.map(item => `${months[item._id.month - 1]} ${item._id.year}`),
    datasets: [
      {
        label: 'New Customers Registered',
        data: sortedData.map(item => item.newCustomers),
        backgroundColor: 'rgba(280, 75, 60, 0.75)',
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-primary)',
          font: { family: 'Plus Jakarta Sans' }
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'var(--border-color)' },
        ticks: { color: 'var(--text-secondary)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'var(--text-secondary)' }
      }
    }
  };

  return <Bar data={data} options={options} />;
};
