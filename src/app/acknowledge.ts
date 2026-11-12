/** Marks a GitHub message from an allowed person as seen, with a 😄 reaction, before any Session starts. */
import { z } from 'zod'
import type { Trigger } from '../core/index.ts'
import type { Commands } from '../infra/commands.ts'
import { allowedSender, type Settings } from '../policy.ts'

/** The GitHub reaction content for 😄. */
const REACTION = 'laugh'

/**
 * Reacts to the comment that started the work, so the person sees the agent took the message while it works.
 * Only a message on GitHub that addresses the agent and comes from someone on the Source's allowed list is marked.
 * The reaction is a courtesy, never a precondition: callers ignore its failure, and it grants no authority.
 */
export async function acknowledgeGithub(settings: Settings, commands: Commands, trigger: Trigger): Promise<void> {
  if (trigger.source !== 'github' || !trigger.human || trigger.addressed !== 'mention') return
  if (!allowedSender(settings, trigger.actor)) return
  const comment = trigger.meta.commentId
  const kind = trigger.meta.kind
  if (typeof comment !== 'number' || (kind !== 'conversation' && kind !== 'inline')) return
  const path = kind === 'inline' ? `pulls/comments/${comment}/reactions` : `issues/comments/${comment}/reactions`
  await commands.api(z.unknown(), path, '--method', 'POST', '-f', `content=${REACTION}`)
}
