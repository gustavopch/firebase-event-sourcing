let emailService: Services.Email.Instance | null = null

declare global {
  namespace Services.Email {
    type Instance = {
      send: (params: { to: string; body: string }) => Promise<void>
    }
  }
}

const createEmailService = (): Services.Email.Instance => {
  return {
    send: async ({ to, body }) => {
      await new Promise(resolve => setTimeout(resolve, 200))
      console.log(`Sent email to ${to}`)
    },
  }
}

export const getEmailService = (): Services.Email.Instance => {
  if (!emailService) {
    emailService = createEmailService()
  }

  return emailService
}
