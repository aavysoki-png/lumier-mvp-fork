import { PrismaClient, ReaderTier, SessionType, SessionStatus, OrderStatus, AsyncReadingStatus, SenderType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.message.deleteMany()
  await prisma.asyncReading.deleteMany()
  await prisma.order.deleteMany()
  await prisma.session.deleteMany()
  await prisma.question.deleteMany()
  await prisma.insightArticle.deleteMany()
  await prisma.tarotReader.deleteMany()
  await prisma.user.deleteMany()

  // Readers
  const readers = await Promise.all([
    prisma.tarotReader.create({
      data: {
        name: 'Elara Voss',
        specialization: 'Relationships & Emotional Clarity',
        tier: ReaderTier.MASTER,
        price: 120,
        rating: 4.97,
        bio: 'With 14 years of practice, Elara brings profound depth to questions of love, partnership, and self-worth. Her readings are known for their precision and lasting resonance.',
        imageUrl: null,
      },
    }),
    prisma.tarotReader.create({
      data: {
        name: 'Marcus Thiel',
        specialization: 'Career & Life Direction',
        tier: ReaderTier.SENIOR,
        price: 85,
        rating: 4.89,
        bio: 'Marcus combines classical tarot methodology with an intuitive sense for timing and opportunity. Ideal for those at professional crossroads.',
        imageUrl: null,
      },
    }),
    prisma.tarotReader.create({
      data: {
        name: 'Solin Park',
        specialization: 'Spiritual Growth & Inner Work',
        tier: ReaderTier.MASTER,
        price: 140,
        rating: 4.95,
        bio: 'Solin holds space for deep introspection, helping clients navigate transformation, grief, and awakening with clarity and compassion.',
        imageUrl: null,
      },
    }),
    prisma.tarotReader.create({
      data: {
        name: 'Nadia Orel',
        specialization: 'Daily Guidance & Practical Insight',
        tier: ReaderTier.FOUNDATION,
        price: 55,
        rating: 4.82,
        bio: 'Nadia offers grounded, actionable readings for everyday questions. Clear, warm, and consistently accurate.',
        imageUrl: null,
      },
    }),
    prisma.tarotReader.create({
      data: {
        name: 'James Calloway',
        specialization: 'Shadow Work & Subconscious Patterns',
        tier: ReaderTier.SENIOR,
        price: 95,
        rating: 4.91,
        bio: 'A former Jungian therapist turned reader, James excels in uncovering hidden motivations and repeating patterns that block growth.',
        imageUrl: null,
      },
    }),
  ])

  // Insights
  await Promise.all([
    prisma.insightArticle.create({
      data: {
        title: 'The Art of Asking the Right Question',
        preview: 'The quality of your reading begins long before the cards are drawn. It starts with how you frame what you want to understand.',
        content: `The quality of your reading begins long before the cards are drawn. It starts with how you frame what you want to understand.

Most people approach tarot with outcome-focused questions: "Will I get the job?" or "Does he love me?" These questions place your agency outside yourself — they treat the future as fixed and the cards as a window into fate.

The most transformative readings emerge from questions that return agency to you.

**From outcome to insight**

Instead of "Will I get the job?" consider: "What do I need to understand about this opportunity and my readiness for it?"

Instead of "Does he love me?" try: "What am I not seeing clearly about this relationship dynamic?"

This reframe isn't semantic. It fundamentally changes what you're asking the cards to illuminate. Outcome questions request a verdict. Insight questions request a mirror.

**The zone of productive uncertainty**

The best questions sit in what I call the zone of productive uncertainty — they're about something that genuinely matters to you, where you have real stakes, and where you have room to grow or shift your perspective.

If you already know the answer, the reading will feel flat. If the question doesn't matter, the cards will feel arbitrary. The sweet spot is the question that makes you slightly uncomfortable to ask out loud.

**Before your next reading**

Take three minutes before you begin. Write your question down. Read it back to yourself. Ask: Am I asking for a verdict, or am I asking for understanding? If it's a verdict — rewrite it. The cards will thank you.`,
        category: 'practice',
        readTime: 4,
      },
    }),
    prisma.insightArticle.create({
      data: {
        title: 'When a Reading Doesn\'t Resonate',
        preview: 'Not every reading lands immediately. Here\'s how to sit with one that feels off — and what it might be trying to tell you.',
        content: `Not every reading lands immediately. Sometimes the cards feel random, disconnected from your question, or simply wrong.

This is more informative than a resonant reading, if you know how to work with it.

**Resistance as signal**

When a reading doesn't resonate, your first instinct might be to dismiss it. Resist that impulse. Sit with the discomfort for a moment. Ask yourself: is this reading off, or is it off from what I wanted to hear?

There is a difference. The first is worth investigating. The second is worth sitting with.

**The literal vs. the symbolic**

Tarot communicates primarily through metaphor. A card showing conflict doesn't necessarily mean external conflict — it might point to internal tension you've been suppressing. A card suggesting loss might be pointing toward what you need to release, not what's being taken.

If a reading feels wrong, try reading every card one level more abstractly than your first interpretation.

**The question behind the question**

Sometimes a reading doesn't resonate because the cards are answering a different question than the one you asked — specifically, the question underneath your question.

You asked about the job. The cards answered about your fear of visibility. You asked about the relationship. The cards answered about your relationship with yourself.

When a reading feels misaligned, ask: what question might these cards actually be answering?

**Returning to it**

A reading that felt irrelevant three months ago may become startlingly clear when you return to it. Keep a record of your readings. The ones that confused you most often become the most instructive over time.`,
        category: 'practice',
        readTime: 5,
      },
    }),
    prisma.insightArticle.create({
      data: {
        title: 'Understanding Reader Tiers',
        preview: 'What separates a Foundation reader from a Master? It\'s not just years — it\'s the kind of depth each brings to different questions.',
        content: `Choosing a reader isn't only about budget. Each tier offers something qualitatively different, and the right choice depends on what you're navigating.

**Foundation Readers**

Foundation readers are skilled practitioners who bring warmth, consistency, and clarity to practical questions. They're ideal for: daily or weekly guidance, decision points with clear parameters, and people who are new to tarot consultation and want an accessible entry point.

What they offer: grounded, actionable readings. What to bring them: concrete questions about your day-to-day life.

**Senior Readers**

Senior readers have typically worked with hundreds of clients across complex life situations. They've developed the pattern recognition to notice what a client isn't saying, and the skill to navigate emotionally charged questions without losing precision.

Ideal for: relationship dynamics, career pivots, questions with layered emotional stakes. What they offer: depth and nuance. What to bring them: the thing you've been circling around but haven't quite said.

**Master Readers**

Master readers work primarily with questions of transformation — the ones that don't have clean answers because they're really asking about who you're becoming, not what you should do.

They're slower. More expensive. Not always more comfortable. But for the right question at the right moment, a Master reading can be genuinely clarifying in ways that linger for years.

Ideal for: major life transitions, long-standing patterns that haven't shifted, grief, and questions that require more than advice.

**The honest recommendation**

Start where your question actually lives. A Foundation reader with a clear question will outperform a Master reader with a vague one every time.`,
        category: 'guide',
        readTime: 5,
      },
    }),
    prisma.insightArticle.create({
      data: {
        title: 'On the Ethics of Timing Questions',
        preview: 'Questions about "when" are among the most requested — and the most misunderstood. Here\'s what tarot can and can\'t offer around timing.',
        content: `"When will this happen?" is one of the most common questions readers receive, and one of the most genuinely difficult to answer well.

Not because timing is impossible to read, but because the nature of time in tarot works differently than most clients expect.

**How tarot relates to time**

Tarot doesn't read a fixed timeline — it reads current trajectories. The cards reveal what's likely to unfold given present conditions, energies, and patterns. This means timing in tarot is always conditional: it points toward when something is likely to happen if things continue as they are.

This is both more honest and more useful than a fixed date, though it requires more from the client.

**What affects timing**

Three things most significantly affect whether and when an outcome manifests:

1. **Your readiness** — Some things can't happen until you've completed an internal process. The cards often point here first.

2. **External momentum** — Some situations have their own timing, and your role is patience or preparation rather than action.

3. **Unresolved interference** — Something in the present is blocking forward movement. The cards may show the block before they show the timeline.

**Asking better timing questions**

Instead of "when will I meet my partner?" try: "What conditions need to be in place for me to be ready for a committed relationship — and how close am I to those conditions?"

This gives you something to work with. The timing becomes something you can influence, rather than something that happens to you.

**What Master readers do differently**

Experienced readers don't avoid timing — they contextualize it. They'll tell you what needs to shift before timing becomes the relevant question. That conversation is often more valuable than a date.`,
        category: 'insight',
        readTime: 6,
      },
    }),
    prisma.insightArticle.create({
      data: {
        title: 'Preparing for a Live Session',
        preview: 'A live reading rewards preparation. These simple practices will help you arrive with the clarity to make the most of your time.',
        content: `A live reading is a conversation, not a performance. Your preparation directly affects its quality.

**The night before**

Take ten minutes with your question. Write it down. Not the polished version — the raw version. Then look at it and ask: what am I really asking? Sometimes the real question is one layer deeper than what you first wrote.

If you can, return to it in the morning. Sleep often clarifies what's essential.

**Arriving in the right state**

You don't need to be calm to have a good reading. You do need to be present. If you're arriving frantic — from a full workday, a difficult conversation, a distracted commute — take five minutes before the session to consciously set those aside.

A simple practice: three slow breaths. A single statement to yourself about what you're here to explore. That's enough.

**What to bring and not bring**

Bring: a specific question or area, openness to what the cards actually say (not what you hope they say), and permission to be surprised.

Don't bring: a need for the reading to confirm what you've already decided. This doesn't mean you can't disagree — you can and sometimes should. It means arriving without already having closed the question.

**During the session**

Say what you notice. If something a reader says doesn't land, say so — that's useful information. If something lands hard, say so. A live reading is more accurate when it's genuinely responsive.

Your reader is reading energy and cards, not a script. The more present you are, the more accurate the reading tends to be.

**After the session**

Take notes. Not immediately — let yourself sit with what came up for a few hours first. Then write down what you're carrying. The things that made you uncomfortable are often worth particular attention.`,
        category: 'guide',
        readTime: 5,
      },
    }),
  ])

  // Demo user
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      dateOfBirth: new Date('1990-06-15'),
    },
  })

  // Demo question
  const demoQuestion = await prisma.question.create({
    data: {
      userId: demoUser.id,
      text: 'I am at a crossroads in my career. I have an opportunity to leave my stable role for something uncertain but exciting. What do I need to understand about this choice?',
      category: 'career',
    },
  })

  // Demo session (completed async)
  const demoSession = await prisma.session.create({
    data: {
      userId: demoUser.id,
      readerId: readers[1].id, // Marcus
      type: SessionType.ASYNC,
      status: SessionStatus.COMPLETED,
    },
  })

  await prisma.order.create({
    data: {
      userId: demoUser.id,
      sessionId: demoSession.id,
      amount: 85,
      status: OrderStatus.PAID,
    },
  })

  await prisma.asyncReading.create({
    data: {
      sessionId: demoSession.id,
      status: AsyncReadingStatus.COMPLETED,
      completedAt: new Date(),
      resultText: `**Your Reading: The Crossroads**

*Three cards were drawn for your question about career transition.*

---

**Position 1 — Where You Stand: The Eight of Pentacles**

You have built real competency in your current role. This card confirms what you likely already sense: you are not leaving because you have failed here, or because you are running from difficulty. You have genuinely mastered something. The Eight of Pentacles asks you to honor that, rather than minimizing it in your anxiety about what comes next.

This matters because transitions undertaken from a place of recognized strength land differently than those made from restlessness or fear.

---

**Position 2 — What You Are Moving Toward: The Fool**

The Fool is the card of genuine new beginnings — not naive leaps, but the kind of step that cannot be fully understood from where you currently stand. Its appearance here is significant. It suggests that the "uncertainty" you named in your question is not a problem to be solved before you proceed; it is the nature of the threshold itself.

The Fool does not carry a map. He carries enough.

What you are being invited into is not a clear path — it is a genuine opening. The fear that accompanies this is appropriate. It is the appropriate response to real possibility.

---

**Position 3 — What This Transition Requires of You: The High Priestess**

This is the card I want you to sit with longest. The High Priestess asks you to listen more deeply to what you already know, before you reach for external validation.

You have been asking others whether you should do this. You have been running the numbers, seeking reassurance. None of that is wrong — but it has also been a way of postponing a quieter conversation with yourself.

She asks: what do you know, in the part of you that doesn't need to be convinced?

---

**In Summary**

You have the foundation. The opportunity is real. What stands between you and stepping into it is not information — it is the permission you have not yet fully given yourself.

The cards do not tell you to go or to stay. They tell you that you are more prepared than you feel, that what awaits is genuinely unknown and genuinely worth knowing, and that the clarity you are seeking will not come from more analysis.

It will come from listening to what you already know.`,
    },
  })

  // Demo live session with messages
  const liveSession = await prisma.session.create({
    data: {
      userId: demoUser.id,
      readerId: readers[0].id, // Elara
      type: SessionType.LIVE,
      status: SessionStatus.COMPLETED,
    },
  })

  await prisma.message.createMany({
    data: [
      {
        sessionId: liveSession.id,
        senderType: SenderType.READER,
        content: "Welcome. I've taken a moment to center myself with your question. When you're ready, tell me a little more about what's at the heart of what you're asking.",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        sessionId: liveSession.id,
        senderType: SenderType.USER,
        content: "I've been in this relationship for three years and I feel like I've lost myself a bit. I'm not sure if I'm staying out of love or out of habit.",
        createdAt: new Date(Date.now() - 28 * 60 * 1000),
      },
      {
        sessionId: liveSession.id,
        senderType: SenderType.READER,
        content: "Thank you for naming that distinction — love versus habit. That's an honest and courageous question to sit with. I'm drawing three cards now.",
        createdAt: new Date(Date.now() - 26 * 60 * 1000),
      },
    ],
  })

  console.log('✅ Seed complete.')
  console.log(`   ${readers.length} readers created`)
  console.log(`   5 insight articles created`)
  console.log(`   1 demo user created`)
  console.log(`   2 demo sessions created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
