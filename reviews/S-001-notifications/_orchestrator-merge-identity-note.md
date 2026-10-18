# Note: six merge commits under the wrong identity

*Recorded by the Orchestrator, 2026-10-18, after build review round 1, part 1, note 10.*

The merge commits efada7e, c72d9c2, f198716, bbf7f0f, a991ea6 and dae0e76 on orch/s001-notifications
were made by the Orchestrator without its `-c user.name=orchestrator -c user.email=orchestrator@agents.invalid`
flags, so they carry the environment's default identity, `Claude <noreply@anthropic.com>`, instead of
`orchestrator <orchestrator@agents.invalid>` (AGENTS.md §1, CLAUDE.md). Each still carries its
`Agent-Session:` trailer. They were already pushed, so they are not rewritten (no force-push of pushed
history). The surface guard skips merge commits, so no check is affected; the commits they merge keep
their own authors. Every later Orchestrator commit uses the flags.
