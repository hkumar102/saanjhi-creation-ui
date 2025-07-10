export const AppMessages = {
  auth: {
    loginSuccess: 'You have successfully logged in.',
    loginFailed: 'Login failed. Please check your credentials and try again.',
    sessionExpired: 'Your session has expired. Please log in again.'
  },
  server: {
    genericError: 'Something went wrong. Please try again later.',
    networkError: 'Unable to connect. Either API is down or check your internet connection.'
  },
  application: {
    confirmation: {
      deleteSuccess: '{0} has been deleted successfully.',
      createSuccess: '{0} has been created successfully.',
      updateSuccess: '{0} has been updated successfully.',
      createFailed: 'Failed to create {0}. Please try again.',
      updateFailed: 'Failed to update {0}. Please try again.',
      deleteFailed: 'Failed to delete {0}. Please try again.',
      deleteConfirmation: 'Are you sure you want to delete {0}?',
    },
    errors: {
      http: {
        genericError: 'Something went wrong. Please try again later.',
        networkError: 'Unable to connect. Either API is down or check your internet connection.',
        notFound: 'The requested resource was not found.',
        unauthorized: 'You are not authorized to perform this action.',
        forbidden: 'You do not have permission to access this resource.',
        validationError: 'There were validation errors. Please check your input and try again.',
      },
      validation: {
        required: '{0} is required.',
        minLength: '{0} must be at least {1} characters long.',
        maxLength: '{0} cannot exceed {1} characters.',
        email: 'Please enter a valid email address.',
        pattern: 'The format of {0} is invalid.'
      },
    },
    reports: {
      dateRangeRequired: 'Please select valid date range',
      loadReportError: 'Failed to load report data',
      noDataToExport: 'No data available to export',
      exportSuccess: 'Report exported successfully',
      exportError: 'Failed to export report',
      startDateAfterEndDate: 'Start date cannot be after end date',
      generatingReport: 'Generating report...',
      selectDateRange: 'Select a date range to generate report',
      exportComingSoon: 'Export functionality coming soon'
    }
  }
};