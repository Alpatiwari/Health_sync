// Data processing utilities for health data analysis

export const dataProcessing = {
  // Calculate moving average
  calculateMovingAverage: (data, windowSize = 7) => {
    if (!data || data.length < windowSize) return data;
    
    const result = [];
    for (let i = windowSize - 1; i < data.length; i++) {
      const sum = data.slice(i - windowSize + 1, i + 1).reduce((acc, val) => acc + val, 0);
      result.push({
        ...data[i],
        value: sum / windowSize,
        originalValue: data[i].value
      });
    }
    return result;
  },

  // Calculate correlation coefficient
  calculateCorrelation: (dataX, dataY) => {
    if (!dataX || !dataY || dataX.length !== dataY.length || dataX.length === 0) {
      return 0;
    }

    const n = dataX.length;
    const sumX = dataX.reduce((sum, val) => sum + val, 0);
    const sumY = dataY.reduce((sum, val) => sum + val, 0);
    const sumXY = dataX.reduce((sum, val, i) => sum + val * dataY[i], 0);
    const sumX2 = dataX.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = dataY.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  },

  // Normalize data to 0-1 range
  normalizeData: (data, key = 'value') => {
    if (!data || data.length === 0) return data;
    
    const values = data.map(item => item[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    if (range === 0) return data.map(item => ({ ...item, normalized: 0.5 }));

    return data.map(item => ({
      ...item,
      normalized: (item[key] - min) / range
    }));
  },

  // Group data by time period
  groupByTimePeriod: (data, period = 'day') => {
    if (!data || data.length === 0) return {};

    const grouped = {};
    
    data.forEach(item => {
      const date = new Date(item.date || item.timestamp);
      let key;

      switch (period) {
        case 'hour':
          key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
          break;
        case 'day':
          key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${date.getMonth()}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return grouped;
  },

  // Calculate statistics for a dataset
  calculateStatistics: (data, key = 'value') => {
    if (!data || data.length === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        mode: 0,
        standardDeviation: 0,
        variance: 0
      };
    }

    const values = data.map(item => typeof item === 'number' ? item : item[key]).filter(val => !isNaN(val));
    const sortedValues = [...values].sort((a, b) => a - b);
    const count = values.length;

    if (count === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        mode: 0,
        standardDeviation: 0,
        variance: 0
      };
    }

    const min = sortedValues[0];
    const max = sortedValues[count - 1];
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / count;

    // Median
    const median = count % 2 === 0 
      ? (sortedValues[count / 2 - 1] + sortedValues[count / 2]) / 2
      : sortedValues[Math.floor(count / 2)];

    // Mode
    const frequency = {};
    let maxFreq = 0;
    let mode = values[0];
    
    values.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
      if (frequency[val] > maxFreq) {
        maxFreq = frequency[val];
        mode = val;
      }
    });

    // Variance and standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
    const standardDeviation = Math.sqrt(variance);

    return {
      count,
      min,
      max,
      mean,
      median,
      mode,
      standardDeviation,
      variance,
      sum
    };
  },

  // Detect outliers using IQR method
  detectOutliers: (data, key = 'value', factor = 1.5) => {
    if (!data || data.length < 4) return { outliers: [], cleaned: data };

    const values = data.map(item => item[key]).sort((a, b) => a - b);
    const q1Index = Math.floor(values.length * 0.25);
    const q3Index = Math.floor(values.length * 0.75);
    const q1 = values[q1Index];
    const q3 = values[q3Index];
    const iqr = q3 - q1;
    const lowerBound = q1 - factor * iqr;
    const upperBound = q3 + factor * iqr;

    const outliers = [];
    const cleaned = [];

    data.forEach(item => {
      if (item[key] < lowerBound || item[key] > upperBound) {
        outliers.push(item);
      } else {
        cleaned.push(item);
      }
    });

    return { outliers, cleaned, bounds: { lower: lowerBound, upper: upperBound } };
  },

  // Smooth data using exponential smoothing
  exponentialSmoothing: (data, alpha = 0.3, key = 'value') => {
    if (!data || data.length === 0) return data;

    const result = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      const smoothed = alpha * data[i][key] + (1 - alpha) * result[i - 1][key];
      result.push({
        ...data[i],
        [key]: smoothed,
        [`original_${key}`]: data[i][key]
      });
    }

    return result;
  },

  // Calculate trend
  calculateTrend: (data, key = 'value') => {
    if (!data || data.length < 2) return 0;

    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, item) => sum + item[key], 0);
    const sumXY = data.reduce((sum, item, index) => sum + index * item[key], 0);
    const sumX2 = data.reduce((sum, _, index) => sum + index * index, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  },

  // Fill missing data points
  fillMissingData: (data, method = 'linear') => {
    if (!data || data.length < 2) return data;

    const result = [...data];
    
    for (let i = 1; i < result.length - 1; i++) {
      if (result[i].value === null || result[i].value === undefined) {
        const prevIndex = i - 1;
        const nextIndex = i + 1;
        
        if (result[prevIndex].value !== null && result[nextIndex].value !== null) {
          switch (method) {
            case 'linear':
              result[i].value = (result[prevIndex].value + result[nextIndex].value) / 2;
              break;
            case 'forward':
              result[i].value = result[prevIndex].value;
              break;
            case 'backward':
              result[i].value = result[nextIndex].value;
              break;
            default:
              result[i].value = 0;
          }
          result[i].filled = true;
        }
      }
    }

    return result;
  },

  // Calculate percentile
  calculatePercentile: (data, percentile, key = 'value') => {
    if (!data || data.length === 0) return 0;
    
    const values = data.map(item => item[key]).sort((a, b) => a - b);
    const index = (percentile / 100) * (values.length - 1);
    
    if (index % 1 === 0) {
      return values[index];
    } else {
      const lower = values[Math.floor(index)];
      const upper = values[Math.ceil(index)];
      return lower + (upper - lower) * (index % 1);
    }
  },

  // Aggregate data by time windows
  aggregateByTimeWindow: (data, windowSize, aggregateFunction = 'mean') => {
    if (!data || data.length === 0) return [];

    const result = [];
    
    for (let i = 0; i < data.length; i += windowSize) {
      const window = data.slice(i, i + windowSize);
      const values = window.map(item => item.value).filter(val => val !== null && val !== undefined);
      
      if (values.length === 0) continue;

      let aggregatedValue;
      switch (aggregateFunction) {
        case 'sum':
          aggregatedValue = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        case 'mean':
        default:
          aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
      }

      result.push({
        ...window[0],
        value: aggregatedValue,
        count: values.length,
        windowStart: window[0].date,
        windowEnd: window[window.length - 1].date
      });
    }

    return result;
  }
};

export const { calculateCorrelation } = dataProcessing;