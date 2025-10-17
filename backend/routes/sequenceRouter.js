const express = require('express')
const sequenceRouter = express.Router()
const builder = require('../builder')

// Error handler wrapper for async routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/**
 * GET /api/sequence/:sequenceType
 * Get the next sequence number for a specific type
 * @param {string} sequenceType - The type of sequence (e.g., 'disbursement_voucher')
 * @returns {object} { nextValue, formattedValue, sequenceType }
 */
sequenceRouter.get('/:sequenceType', asyncHandler(async (req, res) => {
  const { sequenceType } = req.params

  // Validate sequence type
  if (!sequenceType || sequenceType.trim() === '') {
    return res.status(400).json({ 
      error: 'Invalid sequence type',
      message: 'Sequence type is required'
    })
  }

  try {
    // Call stored procedure to get next sequence
    const [results] = await builder.raw(
      'CALL get_next_sequence(?, @next_val, @formatted)',
      [sequenceType]
    )

    // Get the output parameters
    const [output] = await builder.raw(
      'SELECT @next_val as nextValue, @formatted as formattedValue'
    )

    const { nextValue, formattedValue } = output[0]

    // Check if sequence type exists
    if (!nextValue || !formattedValue) {
      return res.status(404).json({
        error: 'Sequence not found',
        message: `No active sequence found for type: ${sequenceType}`
      })
    }

    res.status(200).json({
      nextValue: Number(nextValue),
      formattedValue: formattedValue,
      sequenceType: sequenceType
    })

  } catch (error) {
    console.error('Error getting next sequence:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate sequence number'
    })
  }
}))

/**
 * GET /api/sequence
 * Get all available sequence types and their current values
 * @returns {array} Array of sequence settings
 */
sequenceRouter.get('/', asyncHandler(async (req, res) => {
  try {
    const sequences = await builder
      .select(
        'id',
        'sequence_type as sequenceType',
        'current_value as currentValue',
        'prefix',
        'suffix',
        'description',
        'is_active as isActive'
      )
      .from('sequence_settings')
      .orderBy('sequence_type', 'asc')

    // Format the current values for display
    const formattedSequences = sequences.map(seq => ({
      ...seq,
      formattedCurrentValue: `${seq.prefix || ''}${String(seq.currentValue).padStart(6, '0')}${seq.suffix || ''}`,
      isActive: Boolean(seq.isActive)
    }))

    res.status(200).json(formattedSequences)

  } catch (error) {
    console.error('Error fetching sequences:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch sequence settings'
    })
  }
}))

/**
 * POST /api/sequence
 * Create a new sequence type
 * @body {string} sequenceType - Unique sequence type identifier
 * @body {string} [description] - Description of the sequence
 * @body {string} [prefix] - Prefix for formatted value
 * @body {string} [suffix] - Suffix for formatted value
 * @body {number} [startingValue=1] - Starting value for the sequence
 */
sequenceRouter.post('/', asyncHandler(async (req, res) => {
  const { 
    sequenceType, 
    description, 
    prefix, 
    suffix, 
    startingValue = 1 
  } = req.body

  // Validation
  if (!sequenceType || sequenceType.trim() === '') {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Sequence type is required'
    })
  }

  if (startingValue < 1) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Starting value must be at least 1'
    })
  }

  try {
    // Check if sequence type already exists
    const existing = await builder
      .select('id')
      .from('sequence_settings')
      .where('sequence_type', sequenceType)
      .first()

    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Sequence type '${sequenceType}' already exists`
      })
    }

    // Insert new sequence
    const [id] = await builder('sequence_settings').insert({
      sequence_type: sequenceType,
      current_value: startingValue,
      prefix: prefix || null,
      suffix: suffix || null,
      description: description || null,
      is_active: 1
    })

    res.status(201).json({
      id,
      sequenceType,
      currentValue: startingValue,
      prefix,
      suffix,
      description,
      message: 'Sequence created successfully'
    })

  } catch (error) {
    console.error('Error creating sequence:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create sequence'
    })
  }
}))

/**
 * PUT /api/sequence/:sequenceType
 * Update sequence settings (does not affect current_value)
 * @param {string} sequenceType - The sequence type to update
 * @body {string} [description] - Updated description
 * @body {string} [prefix] - Updated prefix
 * @body {string} [suffix] - Updated suffix
 * @body {boolean} [isActive] - Active status
 */
sequenceRouter.put('/:sequenceType', asyncHandler(async (req, res) => {
  const { sequenceType } = req.params
  const { description, prefix, suffix, isActive } = req.body

  try {
    // Build update object with only provided fields
    const updateData = {}
    if (description !== undefined) updateData.description = description
    if (prefix !== undefined) updateData.prefix = prefix || null
    if (suffix !== undefined) updateData.suffix = suffix || null
    if (isActive !== undefined) updateData.is_active = isActive ? 1 : 0

    // Check if sequence exists
    const existing = await builder
      .select('id')
      .from('sequence_settings')
      .where('sequence_type', sequenceType)
      .first()

    if (!existing) {
      return res.status(404).json({
        error: 'Not found',
        message: `Sequence type '${sequenceType}' not found`
      })
    }

    // Update sequence settings
    await builder('sequence_settings')
      .where('sequence_type', sequenceType)
      .update(updateData)

    // Fetch updated sequence
    const updated = await builder
      .select('*')
      .from('sequence_settings')
      .where('sequence_type', sequenceType)
      .first()

    res.status(200).json({
      ...updated,
      isActive: Boolean(updated.is_active),
      message: 'Sequence updated successfully'
    })

  } catch (error) {
    console.error('Error updating sequence:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update sequence'
    })
  }
}))

/**
 * PUT /api/sequence/:sequenceType/reset
 * Reset sequence to a specific value (use with caution)
 * @param {string} sequenceType - The sequence type to reset
 * @body {number} resetValue - The value to reset to
 */
sequenceRouter.put('/:sequenceType/reset', asyncHandler(async (req, res) => {
  const { sequenceType } = req.params
  const { resetValue } = req.body

  // Validation
  if (!resetValue || resetValue < 1) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Reset value must be at least 1'
    })
  }

  try {
    const existing = await builder
      .select('id', 'current_value')
      .from('sequence_settings')
      .where('sequence_type', sequenceType)
      .first()

    if (!existing) {
      return res.status(404).json({
        error: 'Not found',
        message: `Sequence type '${sequenceType}' not found`
      })
    }

    // Update current value
    await builder('sequence_settings')
      .where('sequence_type', sequenceType)
      .update({ current_value: resetValue })

    res.status(200).json({
      sequenceType,
      previousValue: existing.current_value,
      newValue: resetValue,
      message: 'Sequence reset successfully'
    })

  } catch (error) {
    console.error('Error resetting sequence:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to reset sequence'
    })
  }
}))

/**
 * DELETE /api/sequence/:sequenceType
 * Delete a sequence type (use with caution)
 * @param {string} sequenceType - The sequence type to delete
 */
sequenceRouter.delete('/:sequenceType', asyncHandler(async (req, res) => {
  const { sequenceType } = req.params

  try {
    const deleted = await builder('sequence_settings')
      .where('sequence_type', sequenceType)
      .del()

    if (deleted === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: `Sequence type '${sequenceType}' not found`
      })
    }

    res.status(200).json({
      sequenceType,
      message: 'Sequence deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting sequence:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete sequence'
    })
  }
}))

module.exports = { sequenceRouter }