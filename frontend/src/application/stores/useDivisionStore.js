import { create } from 'zustand';
import { DivisionService } from '../services/DivisionService';

const divisionService = new DivisionService();

const useDivisionStore = create((set, get) => ({
  divisions: [],
  divisionMetrics: {},
  yearGroups: {},
  selectedDivision: null,
  loading: false,
  error: null,

  /**
   * Fetch all divisions with their metrics
   */
  fetchDivisionsWithMetrics: async () => {
    set({ loading: true, error: null });

    const result = await divisionService.getDivisionsWithMetrics();

    if (result.success) {
      set({
        divisions: result.data.divisions,
        divisionMetrics: result.data.metrics,
        loading: false
      });
      return result.data;
    } else {
      set({
        error: result.error,
        loading: false
      });
      return null;
    }
  },

  /**
   * Fetch year group comparison data
   */
  fetchYearGroups: async () => {
    set({ loading: true, error: null });

    const result = await divisionService.getYearGroupComparison();

    if (result.success) {
      set({
        yearGroups: result.data,
        loading: false
      });
      return result.data;
    } else {
      set({
        error: result.error,
        loading: false
      });
      return null;
    }
  },

  /**
   * Get metrics for a specific division
   */
  getDivisionMetrics: async (divisionId) => {
    const result = await divisionService.getDivisionMetrics(divisionId);

    if (result.success) {
      // Update the store with the fetched metrics
      set(state => ({
        divisionMetrics: {
          ...state.divisionMetrics,
          [divisionId]: result.data
        }
      }));
      return result.data;
    } else {
      return null;
    }
  },

  /**
   * Set selected division
   */
  setSelectedDivision: (divisionId) => {
    set({ selectedDivision: divisionId });
  },

  /**
   * Get summary statistics across all divisions
   */
  getSummaryStats: () => {
    const { divisionMetrics } = get();

    let totalStudents = 0;
    let totalDivisions = Object.keys(divisionMetrics).length;
    let totalMale = 0;
    let totalFemale = 0;
    let totalTransport = 0;

    Object.values(divisionMetrics).forEach(metrics => {
      if (metrics && metrics.enrollment) {
        totalStudents += metrics.enrollment.total || 0;
        totalMale += metrics.demographics?.gender?.counts?.male || 0;
        totalFemale += metrics.demographics?.gender?.counts?.female || 0;
        totalTransport += metrics.demographics?.transport?.count || 0;
      }
    });

    return {
      totalDivisions,
      totalStudents,
      genderDistribution: {
        male: totalMale,
        female: totalFemale,
        ratio: totalMale > 0 && totalFemale > 0 ? `${totalMale}:${totalFemale}` : 'N/A'
      },
      transportUsers: totalTransport,
      transportPercentage: totalStudents > 0 ? Math.round((totalTransport / totalStudents) * 100) : 0,
      averageClassSize: totalDivisions > 0 ? Math.round(totalStudents / totalDivisions) : 0
    };
  },

  /**
   * Get divisions grouped by year level
   */
  getDivisionsByYearLevel: () => {
    const { divisionMetrics } = get();
    const grouped = {};

    Object.values(divisionMetrics).forEach(metrics => {
      if (metrics && metrics.divisionInfo) {
        const yearLevel = metrics.divisionInfo.yearLevel;
        if (!grouped[yearLevel]) {
          grouped[yearLevel] = [];
        }
        grouped[yearLevel].push(metrics);
      }
    });

    return grouped;
  },

  /**
   * Clear all data
   */
  clearData: () => {
    set({
      divisions: [],
      divisionMetrics: {},
      yearGroups: {},
      selectedDivision: null,
      loading: false,
      error: null
    });
  }
}));

export default useDivisionStore;