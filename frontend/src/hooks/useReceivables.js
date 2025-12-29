import { useState, useCallback } from 'react'
import api from '../utils/api'

const API_BASE_URL = '/api'

/**
 * Custom hook for managing receivables reports
 * @returns {object} Receivables management functions and state
 */
export const useReceivables = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Get receivables report
   * @param {object} filters - { from, to, asOf, groupBy }
   * @returns {Promise<object>} { success, summary, data }
   */
  const getReceivablesReport = useCallback(async (filters) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters.from) params.append('from', filters.from)
      if (filters.to) params.append('to', filters.to)
      if (filters.asOf) params.append('asOf', filters.asOf)
      if (filters.groupBy) params.append('groupBy', filters.groupBy)

      const response = await api.get(
        `${API_BASE_URL}/reports/receivables?${params.toString()}`
      )
      
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch receivables report'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Export receivables report to Excel format
   * @param {object} filters - { from, to, asOf }
   * @returns {Promise<object>} { success, data, summary }
   */
  const exportReceivables = useCallback(async (filters) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters.from) params.append('from', filters.from)
      if (filters.to) params.append('to', filters.to)
      if (filters.asOf) params.append('asOf', filters.asOf)

      const response = await api.get(
        `${API_BASE_URL}/reports/receivables/export?${params.toString()}`
      )
      
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to export receivables'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getReceivablesReport,
    exportReceivables,
    loading,
    error
  }
}

export default useReceivables