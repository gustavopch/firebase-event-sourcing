const projectId = 'fir-event-sourcing'

export const config = {
  firebase: {
    cloudFunctionsBaseUrl: `http://localhost:5001/${projectId}/us-central1/commands`,
    projectId,
  },
}
