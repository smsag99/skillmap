import { Resend } from 'resend'
import { createSupabaseServer } from '@/lib/supabase-server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { roadmapId, email } = await req.json()

  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roadmap } = await supabase
    .from('roadmaps')
    .select('*, tasks(*)')
    .eq('id', roadmapId)
    .single()

  if (!roadmap) return Response.json({ error: 'Roadmap not found' }, { status: 404 })

  const tasks = roadmap.tasks || []
  const completedCount = tasks.filter((t: any) => t.done).length
  const nextTask = tasks.find((t: any) => !t.done)
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  await supabase
    .from('roadmaps')
    .update({ reminder_email: email, reminder_enabled: true })
    .eq('id', roadmapId)

  await resend.emails.send({
    from: 'SkillMap <onboarding@resend.dev>',
    to: email,
    subject: `Your SkillMap daily reminder — ${roadmap.goal}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#0d0d0f;font-family:'DM Sans',sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

            <!-- Logo -->
            <div style="margin-bottom:32px;">
              <span style="
                display:inline-block;padding:8px 14px;
                background:linear-gradient(135deg,#7c6af7,#a78bfa);
                border-radius:8px;color:#fff;font-size:16px;font-weight:500;
              ">✦ SkillMap</span>
            </div>

            <!-- Heading -->
            <h1 style="color:#e8e6e0;font-size:24px;font-weight:400;margin:0 0 8px;letter-spacing:-0.02em;">
              Keep going, you're doing great!
            </h1>
            <p style="color:#555565;font-size:15px;margin:0 0 32px;">
              Your roadmap to <strong style="color:#a78bfa;">${roadmap.goal}</strong> is waiting.
            </p>

            <!-- Progress -->
            <div style="
              background:#111114;border:1px solid #1e1e24;
              border-radius:12px;padding:20px 24px;margin-bottom:24px;
            ">
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                <span style="color:#a0a0b0;font-size:13px;">Overall progress</span>
                <span style="color:#a78bfa;font-size:13px;font-weight:500;">${completedCount}/${tasks.length} tasks · ${progress}%</span>
              </div>
              <div style="height:8px;background:#1e1e24;border-radius:4px;">
                <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,#7c6af7,#a78bfa);border-radius:4px;"></div>
              </div>
            </div>

            <!-- Next task -->
            ${nextTask ? `
            <div style="
              background:#111114;border:1px solid #2a2a44;
              border-radius:12px;padding:20px 24px;margin-bottom:32px;
            ">
              <p style="color:#555565;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px;">
                Up next
              </p>
              <p style="color:#e8e6e0;font-size:15px;font-weight:500;margin:0 0 6px;">
                Day ${nextTask.day} — ${nextTask.title}
              </p>
              <p style="color:#7a7a8e;font-size:13px;line-height:1.6;margin:0;">
                ${nextTask.description}
              </p>
            </div>
            ` : `
            <div style="
              background:#111114;border:1px solid #2a2a44;
              border-radius:12px;padding:20px 24px;margin-bottom:32px;
              text-align:center;
            ">
              <p style="color:#4ade80;font-size:16px;margin:0;">🎉 Roadmap complete! Time to apply!</p>
            </div>
            `}

            <!-- CTA -->
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/roadmap/${roadmapId}" style="
              display:inline-block;padding:14px 28px;
              background:linear-gradient(135deg,#7c6af7,#a78bfa);
              border-radius:10px;color:#fff;font-size:15px;
              font-weight:500;text-decoration:none;
            ">Continue my roadmap →</a>

            <!-- Footer -->
            <p style="color:#333340;font-size:12px;margin-top:40px;">
              Built by Mohammad Sheikh · SkillMap
            </p>
          </div>
        </body>
      </html>
    `,
  })

  return Response.json({ success: true })
}