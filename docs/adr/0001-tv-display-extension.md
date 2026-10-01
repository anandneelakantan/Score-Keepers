# ADR 0001: TV display is a read-only, local-first extension of the host app

- **Status:** Accepted
- **Date:** 2026-10-01

## Context

Scorekeepers is a local-first web app. All game state (`GameRecord`: players,
rounds, settings including the round timer) lives in the browser's IndexedDB
(`web/src/storage/`), and the app works with no Internet connection.

We want to show the live leaderboard and round timer on a TV (Google TV) during
a game. The question is where game state should live once a second screen is
involved.

## Decision

1. **IndexedDB on the host web app is the only source of truth.** The host app
   is the only writer of game data.
2. **The TV app is a read-only display client.** It renders leaderboard and
   timer from state the host sends it. It never writes game data and never
   persists its own copy as authoritative.
3. **Local Wi-Fi / LAN is the primary transport.** The host publishes a
   *display state* snapshot over the local network; the TV subscribes to it.
4. **Pairing is local:** QR code or short PIN, with manual IP entry as a
   fallback.
5. **The base web app must keep working with no network and no TV.** The TV
   feature is additive; nothing in the core scoring flow may depend on it.
6. **A backend is optional and future-only.** If remote viewing is ever
   needed, a backend may hold a *replica* of display state pushed by the host.
   It is never authoritative and never writes back.

```
 ┌───────────────────────────┐   display state (read-only)   ┌──────────────┐
 │ Host web app (writer)     │ ─────── local network ──────▶ │ Google TV app│
 │ IndexedDB = source of     │                               │ (renderer)   │
 │ truth                     │ ─ ─ ─ optional, Phase 3 ─ ─ ▶ backend replica
 └───────────────────────────┘                               └──────────────┘
```

## Rationale

A backend as the source of truth would:

- break the offline-first model the app already has;
- introduce sync and conflict resolution between two state owners;
- add hosting and operational overhead;
- be unnecessary for a TV in the same room as the host.

## Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| Backend-owned game state | Breaks offline-first; second authority; ops cost. |
| Direct peer-to-peer / hotspot-only as primary design | Fragile setup on consumer devices; poor UX as the default path. |
| HDMI / screen mirroring as the main solution | Mirrors the phone UI rather than a 10-foot UI; doesn't scale to a dedicated display. |
| Internet-dependent remote display for the core feature | Violates "works offline". |

Still valid: LAN transport, QR/PIN pairing, manual-IP fallback, and a
backend replica as a later milestone.

## Display contract (initial sketch)

The TV consumes a derived, versioned snapshot — not raw `GameRecord`s — so the
storage schema can evolve without breaking TV clients.

```ts
interface DisplayStateV1 {
  v: 1;
  gameId: string;
  gameName: string;
  seq: number;              // monotonically increasing per host session
  sentAt: number;           // host epoch ms, for staleness detection
  rankDir: 'high' | 'low';
  roundCount: number;
  leaderboard: Array<{
    playerId: string;
    name: string;
    emoji?: string;
    rank: number;
    prevRank: number | null;
    total: number;
    wins: number;
  }>;
  timer: null | {
    roundNum: number;
    durationSec: number;
    state: 'ready' | 'running' | 'paused' | 'expired';
    // When running, TV computes remaining = endsAt - now (corrected by clock
    // offset), so ticking doesn't require a message per second.
    endsAt?: number;
    remainingSec?: number;  // authoritative when not running
  };
}
```

Leaderboard rows mirror `useLeaderboard` output. Timer state is currently
component-local (`useCountdown`); Phase 1 must lift it to a place the
publisher can observe.

## Open question: host-side transport from a browser

The host is a static HTTPS page (GitHub Pages). A browser tab **cannot open a
listening socket**, and HTTPS pages are restricted from connecting to plain
`ws://`/`http://` on private IPs (mixed content / Local Network Access rules).
So "the host exposes state over the LAN" needs a concrete mechanism. Phase 1
starts with a spike to pick one, evaluated against: works offline on LAN, no
backend, acceptable pairing UX.

Candidates:

- **WebRTC data channel, host-candidates only** (no STUN/TURN needed on the
  same LAN). Requires exchanging an offer/answer once; pairing must carry it
  (e.g. TV shows a QR with its offer, phone scans and returns the answer via a
  short code or a second channel). Check Chrome's mDNS host-candidate
  obfuscation against the TV's WebRTC stack.
- **TV app as the LAN endpoint** (TV runs a WebSocket server, host connects
  out). Needs a way around mixed-content blocking — e.g. Chrome Local Network
  Access permission, or serving the host app over the LAN itself.
- **Host app packaged as an installable/native wrapper** that can open
  sockets. Larger scope; only if the browser-only options fail.

The ADR's decisions (single writer, read-only TV, LAN-first, optional replica)
hold regardless of which mechanism wins.

## Phased plan

**Phase 1 — Local-only TV MVP**
1. Define and version the display contract (above).
2. Lift timer state so it can be published; add a "TV display" mode in the host app.
3. Transport spike → implement local streaming of `DisplayStateV1`.
4. Pairing: QR / PIN, manual IP fallback.
5. Google TV app shell (full-screen, D-pad friendly, high-contrast 10-foot UI).
6. Render leaderboard and timer.
7. Reconnect handling and stale-state indication (using `seq` / `sentAt`).
8. Validate on real Google TV hardware.

**Phase 2 — Hardening:** reconnect edge cases, stale-state UX, readability
tuning, broader device validation.

**Phase 3 — Optional backend replica:** host pushes display state to a
backend for remote viewers. Web app remains the only writer; TV and remote
viewers remain read-only. Built only if remote display becomes a real
requirement.

## Consequences

- No change to the core app's storage or offline behaviour.
- The TV app has no persistence or edit UI to build or secure.
- The display contract becomes a compatibility surface; changes go through
  its version field.
- Transport choice is the main Phase 1 risk and is front-loaded as a spike.
