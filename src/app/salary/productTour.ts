export const tourConfig = {
  showProgress: true,
  animate: true,
  smoothScroll: true,
  steps: [
    {
      popover: {
        title: 'Welcome to Salary Predictor!',
        description: 'Let me show you around our salary prediction tool. \
        \n\nClick "Next" to continue the tour or the "x" button on the top-right to stop automatic tours.',
        side: "bottom",
        align: 'start'
      }
    },
    {
      element: '#preset-selector',
      popover: {
        title: 'Job Presets',
        description: 'Start by selecting a job preset, or create your own custom prediction with the clear button.',
        side: "top",
        align: 'start'
      }
    },
    {
      element: '#form-section',
      popover: {
        title: 'Job Details',
        description: 'Fill in the details about the job position you want to analyze.',
        side: "left",
        align: 'start'
      }
    },
    {
      element: '#countries-select',
      popover: {
        title: 'Select Countries',
        description: 'Choose one or more countries to get salary predictions for different regions.',
        side: "top",
        align: 'start'
      }
    },
    {
      element: '#saved-predictions',
      popover: {
        title: 'Saved Predictions',
        description: 'Your predictions will be saved here for future reference. \
        \n\nThis concludes the tour. Thanks for exploring the Salary Predictor!',
        side: "top",
        align: 'start'
      }
    }
  ]
};
