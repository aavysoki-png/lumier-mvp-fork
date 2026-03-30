import { Resend } from 'resend'

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')
  return new Resend(apiKey)
}

function getFrom() {
  return process.env.RESEND_FROM || 'Lumier <onboarding@resend.dev>'
}

// ─── Verification code ────────────────────────────────────────────────────────

export async function sendVerificationCode(to: string, code: string) {
  const resend = getResend()

  const result = await resend.emails.send({
    from: getFrom(),
    to,
    subject: 'Код подтверждения — Lumier',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #1E1A18;">
        <p style="font-size: 24px; font-weight: 300; margin-bottom: 8px; letter-spacing: 0.08em;">Lumier</p>
        <div style="height: 1px; width: 32px; background: #D4954A; margin-bottom: 32px;"></div>

        <p style="font-size: 15px; line-height: 1.7; color: #4A4340; margin-bottom: 24px;">
          Ваш код подтверждения:
        </p>

        <div style="background: #F5F3F0; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 36px; font-weight: 600; letter-spacing: 0.3em; color: #1E1A18; margin: 0;">
            ${code}
          </p>
        </div>

        <p style="font-size: 13px; line-height: 1.6; color: #8C8279;">
          Код действителен 10 минут. Если вы не регистрировались, проигнорируйте это письмо.
        </p>

        <div style="height: 1px; background: #EDE8E2; margin: 32px 0;"></div>
        <p style="font-size: 11px; color: #B5ADA4;">© Lumier — lumierinsight.com</p>
      </div>
    `,
  })

  if (result.error) throw new Error(`Resend error: ${result.error.message}`)
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, token: string) {
  const resend = getResend()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumierinsight.com'
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  const result = await resend.emails.send({
    from: getFrom(),
    to,
    subject: 'Восстановление пароля — Lumier',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #1E1A18;">
        <p style="font-size: 24px; font-weight: 300; margin-bottom: 8px; letter-spacing: 0.08em;">Lumier</p>
        <div style="height: 1px; width: 32px; background: #D4954A; margin-bottom: 32px;"></div>

        <p style="font-size: 15px; line-height: 1.7; color: #4A4340; margin-bottom: 24px;">
          Вы запросили восстановление пароля. Нажмите на кнопку ниже, чтобы задать новый пароль:
        </p>

        <a href="${resetUrl}"
          style="display: inline-block; background: #D4954A; color: #fff; text-decoration: none;
                 padding: 14px 32px; border-radius: 14px; font-size: 14px; font-weight: 500;">
          Восстановить пароль
        </a>

        <p style="font-size: 13px; line-height: 1.6; color: #8C8279; margin-top: 32px;">
          Ссылка действительна 1 час. Если вы не запрашивали восстановление, просто проигнорируйте это письмо.
        </p>

        <div style="height: 1px; background: #EDE8E2; margin: 32px 0;"></div>
        <p style="font-size: 11px; color: #B5ADA4;">© Lumier — lumierinsight.com</p>
      </div>
    `,
  })

  if (result.error) {
    throw new Error(`Resend error: ${result.error.message}`)
  }
}
