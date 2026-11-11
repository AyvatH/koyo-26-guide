// Kōyō Master Colab • Explainable Daily Schedule Overlay Engine (Ported & Upgraded from Codex v11)
var koyoPlanner = (() => {
  'use strict';

  const OWN = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
  const MODES = ['delay', 'light'];

  function toClock(mins) {
    const m = ((Math.round(mins) % 1440) + 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }

  function parseStopTime(timeStr) {
    const raw = String(timeStr || '').trim();
    if (!raw || /veya/i.test(raw)) return null;
    const matches = raw.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g);
    if (!matches || !matches.length) return null;
    const parseHM = (hm) => {
      const [h, m] = hm.split(':').map(Number);
      return h * 60 + m;
    };
    const startMin = parseHM(matches[0]);
    const endMin = matches.length > 1 ? parseHM(matches[1]) : null;
    const durationMin = endMin !== null && endMin >= startMin ? (endMin - startMin) : null;
    return { raw, startMin, endMin, durationMin };
  }

  function formatShiftedTime(parsed, newStartMin) {
    if (!parsed) return '';
    if (parsed.durationMin !== null) {
      return toClock(newStartMin) + ' - ' + toClock(newStartMin + parsed.durationMin);
    }
    return toClock(newStartMin);
  }

  function getStopId(day, stop, idx) {
    return stop.stopId || (day.id + '-s' + idx);
  }

  function isProtectedStop(day, stop, sIdx) {
    if (!day || !stop) return true;
    const title = stop.name || '';
    if (stop.category === 'booked_train' || stop.fixed || stop.paid) return true;
    if (day.date === '2026-11-21' || day.date === '2026-12-12') return true;
    if (/Nozomi|Sagano|Aoniyoshi/i.test(title)) return true;
    // Preserve 22 Nov Oi Flea Market (09:15-13:00) & 13:00 departure anchor
    if (day.date === '2026-11-22' && (sIdx === 1 || sIdx === 2)) return true;
    return false;
  }

  function isEligibleToSkip(day, stop, sIdx, doneMap) {
    if (isProtectedStop(day, stop, sIdx)) return false;
    const sid = getStopId(day, stop, sIdx);
    if (doneMap && doneMap[sid]) return false;
    if (stop.isOptionalDrop) return true;
    return ['sight', 'shopping', 'rest', 'food'].includes(stop.category);
  }

  function isOvernightDay(day) {
    if (!day || !Array.isArray(day.stops)) return true;
    if (day.date === '2026-11-21' || day.date === '2026-12-12') return true;
    let last = -1;
    for (const s of day.stops) {
      const p = parseStopTime(s.time);
      if (!p) continue;
      if (p.startMin < last) return true;
      last = p.startMin;
    }
    return false;
  }

  function validate(day, plan) {
    if (!day || !Array.isArray(day.stops) || !isObj(plan)) return false;
    if (Object.keys(plan).some((k) => !['version', 'mode', 'delay', 'skip', 'times'].includes(k))) return false;
    if (plan.version !== 1 || !MODES.includes(plan.mode)) return false;
    if (!Number.isInteger(plan.delay) || plan.delay < 0 || plan.delay > 180) return false;
    if (!Array.isArray(plan.skip) || !isObj(plan.times)) return false;

    const overnight = isOvernightDay(day);
    if (overnight && (plan.delay > 0 || Object.keys(plan.times).length > 0)) return false;

    const seen = new Set();
    for (const i of plan.skip) {
      if (!Number.isInteger(i) || i < 0 || i >= day.stops.length || seen.has(i)) return false;
      if (isProtectedStop(day, day.stops[i], i)) return false;
      seen.add(i);
    }

    for (const [k, v] of Object.entries(plan.times)) {
      if (!/^(0|[1-9]\d*)$/.test(k)) return false;
      const i = Number(k);
      if (i >= day.stops.length || seen.has(i) || isProtectedStop(day, day.stops[i], i)) return false;
      const pNew = parseStopTime(v);
      const pOrig = parseStopTime(day.stops[i].time);
      if (!pNew || !pOrig) return false;
      if (pNew.startMin < pOrig.startMin || pNew.startMin - pOrig.startMin > 180) return false;
    }
    return true;
  }

  function overlay(day, plan, doneMap) {
    if (!day || !Array.isArray(day.stops)) return [];
    const base = day.stops.map((s, i) => ({
      ...s,
      origIndex: i,
      sid: getStopId(day, s, i),
      originalTime: s.time,
      plannerChanged: false,
      plannerSkipped: false
    }));
    if (!plan || !validate(day, plan)) return base;

    const skipSet = new Set(plan.skip || []);
    const done = doneMap || {};

    return base
      .map((s) => {
        const isDone = !!done[s.sid];
        const isSkipped = skipSet.has(s.origIndex) && !isDone;
        const shiftedTime = OWN(plan.times, String(s.origIndex)) ? plan.times[s.origIndex] : s.time;
        return {
          ...s,
          time: shiftedTime,
          plannerChanged: shiftedTime !== s.originalTime,
          plannerSkipped: isSkipped
        };
      })
      .filter((s) => !s.plannerSkipped);
  }

  function preview(opts) {
    const { day, completedStops = {}, mode = 'delay', delay = 0, skip, activePlan = null } = opts || {};
    const conflicts = [];
    const warnings = [];
    const rows = [];
    const stats = { shifted: 0, skipped: 0, protected: 0, completed: 0 };
    const invalid = { plan: null, rows, conflicts, warnings, stats, canApply: false, unchanged: true };

    if (!day || !Array.isArray(day.stops) || !day.stops.length) {
      conflicts.push('Bu gün için yeniden planlanacak durak bulunamadı.');
      return invalid;
    }
    if (!MODES.includes(mode) || !Number.isInteger(delay) || delay < 0 || delay > 180) {
      conflicts.push('Gecikme 0–180 dakika arasında tam sayı olmalıdır.');
      return invalid;
    }

    const done = completedStops || {};
    const overnight = isOvernightDay(day);
    if (delay > 0 && overnight) {
      conflicts.push('Varış/Dönüş gecesi veya gece yarısı aşımı olan bu günde otomatik saat kaydırma kapalıdır. Bilet saatlerini esas alın.');
    }

    const defaultSkip = mode === 'light'
      ? day.stops.map((s, i) => (s.isOptionalDrop && isEligibleToSkip(day, s, i, done) ? i : -1)).filter((i) => i >= 0)
      : [];
    const requestedSkip = new Set(Array.isArray(skip) ? skip : defaultSkip);

    day.stops.forEach((s, i) => {
      if (requestedSkip.has(i) && !isEligibleToSkip(day, s, i, done)) {
        requestedSkip.delete(i);
        warnings.push((s.name || 'Durak') + ': korunan bilet, sabit saat veya tamamlanmış durak olduğu için korunuyor.');
      }
    });

    const parsedTimes = day.stops.map((s) => parseStopTime(s.time));
    const plan = { version: 1, mode, delay, skip: [], times: {} };
    let carry = overnight ? 0 : delay;
    let lastKeptStart = -1;
    let hasRemaining = false;

    for (let i = 0; i < day.stops.length; i++) {
      const s = day.stops[i];
      const sid = getStopId(day, s, i);
      const isDone = !!done[sid];
      const locked = isProtectedStop(day, s, i);
      const parsed = parsedTimes[i];
      const before = s.time;

      if (isDone) {
        stats.completed++;
        const prevTime = activePlan && activePlan.times ? activePlan.times[i] : null;
        const pPrev = prevTime ? parseStopTime(prevTime) : null;
        if (prevTime && prevTime !== before && !locked && pPrev) {
          plan.times[i] = prevTime;
          lastKeptStart = Math.max(lastKeptStart, pPrev.startMin);
        } else if (parsed) {
          lastKeptStart = Math.max(lastKeptStart, parsed.startMin);
        }
        rows.push({ index: i, name: s.name, before, after: prevTime || before, status: 'done' });
        continue;
      }

      hasRemaining = true;

      if (requestedSkip.has(i)) {
        plan.skip.push(i);
        stats.skipped++;
        rows.push({ index: i, name: s.name, before, after: null, status: 'skipped' });
        const nextParsed = parsedTimes[i + 1];
        if (parsed && nextParsed) {
          const block = Math.max(0, nextParsed.startMin - parsed.startMin - 30);
          carry = Math.max(0, carry - block);
        }
        continue;
      }

      if (locked || !parsed) {
        stats.protected++;
        if (carry > 0 && !overnight && parsed) {
          const hasRemovableEarlier = day.stops.slice(0, i).some((x, xi) => !requestedSkip.has(xi) && isEligibleToSkip(day, x, xi, done));
          conflicts.push(
            before + ' · ' + s.name + ': ' + carry + ' dk gecikme korunan bilet/hedef saate (' + toClock(parsed.startMin) + ') sığmıyor. ' +
            (hasRemovableEarlier ? 'Önceki esnek bir durağı çıkarın veya gecikmeyi azaltın.' : 'Önce çıkarılabilecek esnek durak yok; gecikmeyi düşürün.')
          );
        }
        if (parsed && lastKeptStart > parsed.startMin && !overnight) {
          conflicts.push(s.name + ': önceki adım korunan saatin sonrasına taşıyor.');
        }
        rows.push({ index: i, name: s.name, before, after: before, status: 'locked' });
        if (parsed) lastKeptStart = parsed.startMin;
        carry = 0;
        continue;
      }

      const targetStart = parsed.startMin + carry;
      if (targetStart >= 1440) {
        conflicts.push(s.name + ': yeni saat gece yarısını aşıyor; daha küçük gecikme seçin.');
        rows.push({ index: i, name: s.name, before, after: before, status: 'kept' });
        continue;
      }
      if (targetStart < lastKeptStart) {
        conflicts.push(s.name + ': saat sırası korunamadı.');
      }

      const after = carry > 0 ? formatShiftedTime(parsed, targetStart) : before;
      if (after !== before) {
        plan.times[i] = after;
        stats.shifted++;
      }
      rows.push({ index: i, name: s.name, before, after, status: after === before ? 'kept' : 'moved' });
      lastKeptStart = targetStart;
    }

    if (!hasRemaining) {
      warnings.push('Bu günün tüm durakları tamamlandı işaretli.');
    }
    if (mode === 'light' && !plan.skip.length) {
      warnings.push('Otomatik çıkarılacak esnek durak bulunamadı; aşağıdan dilediğiniz gezi veya alışveriş durağını manuel seçebilirsiniz.');
    }
    warnings.push('Hesap plandaki saat aralıklarına göre muhafazakâr tahmin üretir; çıkarılan durak sonrası en az 30 dk aktarma payı korunur. Canlı tren/trafik bilgisini haritada doğrulayın.');

    if (!conflicts.length && !validate(day, plan)) {
      conflicts.push('Bu alternatif güvenlik doğrulamasından geçmedi; ana rota korundu.');
    }

    const unchanged = stats.shifted === 0 && stats.skipped === 0;
    return {
      plan,
      rows,
      conflicts: Array.from(new Set(conflicts)),
      warnings: Array.from(new Set(warnings)),
      stats,
      canApply: conflicts.length === 0 && !unchanged && hasRemaining,
      unchanged
    };
  }

  return Object.freeze({ preview, overlay, validate, isProtectedStop, isEligibleToSkip, getStopId });
})();

if (typeof window !== 'undefined') {
  window.koyoPlanner = koyoPlanner;
}
