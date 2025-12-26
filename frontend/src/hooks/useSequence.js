import { useState, useCallback } from 'react'
import axios from 'axios'
import api from '../utils/api';

const API_BASE_URL = '/api' // Changed from localhost:5173 to relative path

/**
 * Custom hook for managing sequences
 * @returns {object} Sequence management functions and state
 */
export const useSequence = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Get the next sequence number for a specific type
   * @param {string} sequenceType - The type of sequence
   * @returns {Promise<object>} { nextValue, formattedValue, sequenceType }
   */
  const getNextSequence = useCallback(async (sequenceType) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get(
        `${API_BASE_URL}/sequence/${sequenceType}`
      )
      
      console.log('Raw API response:', response.data) // Debug log
      
      // Return the data directly
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to get sequence number'
      setError(errorMessage)
      console.error('Sequence error:', err) // Debug log
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get all available sequences
   * @returns {Promise<array>} Array of sequence settings
   */
  const getAllSequences = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get(`${API_BASE_URL}/sequence`)
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch sequences'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create a new sequence type
   * @param {object} sequenceData - Sequence configuration
   * @returns {Promise<object>} Created sequence
   */
  const createSequence = useCallback(async (sequenceData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post(
        `${API_BASE_URL}/sequence`,
        sequenceData
      )
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create sequence'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update sequence settings
   * @param {string} sequenceType - The sequence type to update
   * @param {object} updateData - Fields to update
   * @returns {Promise<object>} Updated sequence
   */
  const updateSequence = useCallback(async (sequenceType, updateData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.put(
        `${API_BASE_URL}/sequence/${sequenceType}`,
        updateData
      )
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update sequence'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Reset sequence to a specific value
   * @param {string} sequenceType - The sequence type to reset
   * @param {number} resetValue - The value to reset to
   * @returns {Promise<object>} Reset confirmation
   */
  const resetSequence = useCallback(async (sequenceType, resetValue) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.put(
        `${API_BASE_URL}/sequence/${sequenceType}/reset`,
        { resetValue }
      )
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset sequence'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete a sequence type
   * @param {string} sequenceType - The sequence type to delete
   * @returns {Promise<object>} Deletion confirmation
   */
  const deleteSequence = useCallback(async (sequenceType) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.delete(
        `${API_BASE_URL}/sequence/${sequenceType}`
      )
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete sequence'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getNextSequence,
    getAllSequences,
    createSequence,
    updateSequence,
    resetSequence,
    deleteSequence,
    loading,
    error
  }
}

export default useSequence