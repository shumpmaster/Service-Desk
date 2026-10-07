// POST /api/poll — the poll call (spec S-001, J1, J6). Access-checked first (J8).
import { handle } from '../../lib/api.js';

export function onRequest(context) {
  return handle(context, 'poll');
}
