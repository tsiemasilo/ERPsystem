import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Professional color palette
export const colors = {
  primary: "#1976D2",
  secondary: "#424242",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",
  muted: "#9E9E9E",
  background: "rgba(25, 118, 210, 0.1)",
  gradients: [
    "#1976D2", "#4CAF50", "#FF9800", "#9C27B0", 
    "#F44336", "#00BCD4", "#795548", "#607D8B"
  ],
};

// Common chart options
export const chartOptions = {
  line: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: colors.primary,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#666666",
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666666",
          font: {
            size: 12,
          },
          callback: function(value: any) {
            if (value >= 1000000) {
              return 'R' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return 'R' + (value / 1000).toFixed(0) + 'K';
            }
            return 'R' + value;
          },
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: colors.primary,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
      line: {
        tension: 0.4,
      },
    },
  },

  bar: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: colors.primary,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#666666",
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666666",
          font: {
            size: 12,
          },
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderWidth: 0,
      },
    },
  },

  doughnut: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
          color: "#666666",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: colors.primary,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    },
  },

  pie: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
          color: "#666666",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: colors.primary,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    },
  },
};

// Utility functions for chart data
export const generateChartColors = (count: number) => {
  const baseColors = colors.gradients;
  const result = [];
  
  for (let i = 0; i < count; i++) {
    result.push(baseColors[i % baseColors.length]);
  }
  
  return result;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-ZA').format(value);
};

export const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};
