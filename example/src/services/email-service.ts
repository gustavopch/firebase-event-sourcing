let emailService: EmailService | null = null

type EmailService = {
  send: (params: { to: string; body: string }) => Promise<void>
}

const createEmailService = (): EmailService => {
  return {
    send: async ({ to, body }) => {
      await new Promise(resolve => setTimeout(resolve, 200))
      console.log(`Sent email to ${to}`)
    },
  }
}

export const getEmailService = (): EmailService => {
  if (!emailService) {
    emailService = createEmailService()
  }

  return emailService
}
