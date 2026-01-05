import { useState, useCallback } from "react";
import api from "../utils/api";

const API_BASE_URL = "/api";

/**
 * Custom hook for managing customer loan reports
 * @returns {object} Customer loan report management functions and state
 */
export const useCustomerLoanReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Search customers and their loans by name
   * @param {string} searchTerm - Customer name to search
   * @returns {Promise<object>} { success, count, data }
   */
  const searchCustomerLoans = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("searchTerm", searchTerm);

      const response = await api.get(
        `${API_BASE_URL}/reports/customer-loans/search?${params.toString()}`
      );

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to search customer loans";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get detailed loan information with payment schedules
   * @param {number} loanHeaderId - Loan header ID
   * @returns {Promise<object>} { success, data }
   */
  const getLoanDetails = useCallback(async (loanHeaderId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `${API_BASE_URL}/reports/customer-loans/loan-details/${loanHeaderId}`
      );

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch loan details";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get all customers with loans (for dropdown/autocomplete)
   * @returns {Promise<object>} { success, count, data }
   */
  const getCustomersWithLoans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `${API_BASE_URL}/reports/customer-loans/customers`
      );

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch customers";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchCustomerLoans,
    getLoanDetails,
    getCustomersWithLoans,
    loading,
    error,
  };
};

export default useCustomerLoanReport;
