//! Tray module - the tray icon as a readout of the session.
//!
//! The tray used to change its tooltip and nothing else, which meant the app
//! could be running a session for fifty minutes and look, from the taskbar,
//! exactly like an app doing nothing. The icon now carries the session: the
//! mark sits inside a ring that fills as the run goes on, coloured for what is
//! happening — focus, break, strict, idle — and dimmed while paused.
//!
//! Two things keep that cheap. The ring is quantised to [`STEPS`] positions, so
//! a fifty-minute session repaints two dozen times rather than three thousand;
//! and [`apply`] compares against the last icon it set and returns without
//! touching the OS when nothing has changed. State events arrive once a second,
//! and almost all of them are a no-op here.

use crate::state::AppState;
use crate::types::{SessionType, TimerState, TimerStatus};
use std::sync::{Mutex, OnceLock};
use tauri::image::Image;
use tauri::AppHandle;

/// Edge of the icon handed to the OS. Windows asks for 16 logical pixels and
/// scales, so this is the smallest size that still survives a HiDPI taskbar.
const SIZE: u32 = 32;

/// Samples per pixel per axis when rasterising. Sixteen samples a pixel is
/// enough to keep a 3.5px ring from stair-stepping at this size.
const SS: u32 = 4;

/// Positions the progress arc can take. Twenty-four is a clock face at
/// quarter-hour resolution: fine enough to read as movement, coarse enough that
/// a long session repaints a couple of dozen times instead of once a second.
const STEPS: u8 = 24;

/// Outer radius of the ring, in icon pixels.
const RING_OUTER: f32 = 15.5;

/// Ring thickness. Strict mode draws thicker; see [`Variant::stroke`].
const RING_STROKE: f32 = 3.5;

/// Edge of the app mark inside the ring. Its half-diagonal runs a hair past the
/// ring's inner radius, which is fine — the corners of the mark are empty.
const MARK: u32 = 18;

/// How solid a paused arc is. Between the track and a running arc: enough to
/// still say how far in the session got, not so much that a stopped clock looks
/// like it is running.
const PAUSED_ALPHA: f32 = 0.6;

/// What the tray is showing.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Variant {
    Idle,
    Focus,
    Break,
    Strict,
}

impl Variant {
    /// Colours are the app's own, from `src/index.css`: muted text for idle,
    /// the violet accent for focus, success green for a break and warning amber
    /// for strict mode.
    fn rgb(self) -> (u8, u8, u8) {
        match self {
            Variant::Idle => (155, 161, 168),
            Variant::Focus => (139, 92, 246),
            Variant::Break => (74, 222, 128),
            Variant::Strict => (251, 191, 36),
        }
    }

    /// Strict mode is the one state you cannot leave, so it reads heavier.
    fn stroke(self) -> f32 {
        if matches!(self, Variant::Strict) {
            RING_STROKE + 1.5
        } else {
            RING_STROKE
        }
    }

    /// How solid the unfilled part of the ring is.
    ///
    /// Idle has no arc at all, so its track *is* the ring and has to be plainly
    /// visible. While a session runs the track is only there to show the arc
    /// what it is filling, and competing with it would make the progress harder
    /// to read rather than easier.
    fn track_alpha(self) -> f32 {
        if matches!(self, Variant::Idle) {
            0.85
        } else {
            0.45
        }
    }
}

/// One drawable state of the icon. Also the cache key: two equal `Visual`s
/// render to the same pixels, so there is no reason to ask the OS to swap them.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
struct Visual {
    variant: Variant,
    /// Elapsed fraction of the current run, in `0..=STEPS`.
    step: u8,
    paused: bool,
}

impl Visual {
    /// Arc length in radians, clockwise from twelve o'clock.
    fn sweep(self) -> f32 {
        f32::from(self.step) / f32::from(STEPS) * std::f32::consts::TAU
    }
}

// ============================================================================
// READING THE STATE
// ============================================================================

fn visual_for(state: &AppState) -> Visual {
    let timer = &state.timer;

    let variant = if timer.status == TimerStatus::Idle {
        Variant::Idle
    } else if timer.session_type != SessionType::Focus {
        Variant::Break
    } else if state.strict_mode.is_active {
        Variant::Strict
    } else {
        Variant::Focus
    };

    Visual {
        variant,
        step: elapsed_step(timer),
        paused: timer.status == TimerStatus::Paused,
    }
}

/// Elapsed fraction of the run, quantised to [`STEPS`].
fn elapsed_step(timer: &TimerState) -> u8 {
    if timer.total_seconds == 0 {
        return 0;
    }

    let elapsed = u64::from(timer.total_seconds.saturating_sub(timer.remaining_seconds));
    let total = u64::from(timer.total_seconds);

    ((elapsed * u64::from(STEPS) + total / 2) / total).min(u64::from(STEPS)) as u8
}

fn tooltip_for(state: &AppState) -> &'static str {
    match (
        &state.timer.status,
        &state.timer.session_type,
        state.strict_mode.is_active,
    ) {
        (TimerStatus::Idle, _, _) => "Zetta Focus Console - Idle",
        (TimerStatus::Paused, _, _) => "Zetta Focus Console - Paused",
        (_, SessionType::Focus, true) => "Zetta Focus Console - Strict Mode",
        (_, SessionType::Focus, false) => "Zetta Focus Console - Focus",
        (_, _, _) => "Zetta Focus Console - Break",
    }
}

// ============================================================================
// APPLYING IT
// ============================================================================

/// The last icon and tooltip actually handed to the OS.
static LAST_APPLIED: Mutex<Option<(Visual, &'static str)>> = Mutex::new(None);

fn remember(visual: Visual, tooltip: &'static str) {
    // A poisoned lock here means a previous call panicked mid-update. The cache
    // is one small value with no invariant to violate, and losing the tray over
    // it would be worse than the stale entry, so it is taken back either way.
    *LAST_APPLIED
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner()) = Some((visual, tooltip));
}

/// The icon and tooltip the tray should be built with.
///
/// This is handed to `TrayIconBuilder` rather than applied after the fact, and
/// it has to be. `TrayIcon::set_icon` posts its work to the main-thread event
/// loop and blocks waiting for the reply — which is fine from a command on a
/// worker thread, and a deadlock from `setup`, because `setup` runs *on* the
/// main thread before that loop is running. The reply could never come.
///
/// Building it here also means the tray is never briefly wrong: it wears the
/// session from the moment it appears, rather than the bare app icon until the
/// webview finishes loading and the first state event lands.
pub fn initial(state: &AppState) -> (Image<'static>, &'static str) {
    let visual = visual_for(state);
    let tooltip = tooltip_for(state);
    remember(visual, tooltip);

    (Image::new_owned(render(visual), SIZE, SIZE), tooltip)
}

/// Bring the tray in line with the engine state.
///
/// Called on every state broadcast, and cheap on almost all of them: the work
/// below the cache check only happens when the ring would visibly change.
///
/// Only safe off the main thread — see [`initial`].
pub fn apply(app: &AppHandle, state: &AppState) {
    let visual = visual_for(state);
    let tooltip = tooltip_for(state);

    // A poisoned lock here means a previous call panicked mid-update. The cache
    // is one small value with no invariant to violate, and losing the tray over
    // it would be worse than the stale entry, so it is taken back either way.
    let mut last = LAST_APPLIED
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());

    if *last == Some((visual, tooltip)) {
        return;
    }

    let Some(tray) = app.tray_by_id("main") else {
        return;
    };

    let _ = tray.set_icon(Some(Image::new_owned(render(visual), SIZE, SIZE)));
    let _ = tray.set_tooltip(Some(tooltip));

    *last = Some((visual, tooltip));
}

// ============================================================================
// DRAWING
// ============================================================================

/// The app mark, decoded once and scaled to sit inside the ring.
fn mark() -> &'static [u8] {
    static CACHE: OnceLock<Vec<u8>> = OnceLock::new();

    CACHE.get_or_init(|| {
        // The bundled icon, which `tauri.conf.json` already ships. Decoding it
        // rather than checking in four more PNGs keeps the tray in step with
        // the app's identity: change the icon and the tray follows.
        match Image::from_bytes(include_bytes!("../icons/64x64.png")) {
            Ok(source) => downscale(source.rgba(), source.width(), source.height(), MARK),
            // A ring with nothing in it is still a working tray icon, and this
            // is a compiled-in asset, so the failure is a build problem rather
            // than something a user can hit.
            Err(_) => vec![0u8; (MARK * MARK * 4) as usize],
        }
    })
}

/// Box-filter an RGBA image down to `size` square.
///
/// Averaging is done on premultiplied colour. Straight averaging pulls the
/// colour of an edge pixel toward whatever is stored in the fully transparent
/// pixels next to it — usually black — which fringes the mark.
fn downscale(src: &[u8], sw: u32, sh: u32, size: u32) -> Vec<u8> {
    let mut out = vec![0u8; (size * size * 4) as usize];

    for y in 0..size {
        let y0 = y * sh / size;
        let y1 = ((y + 1) * sh / size).max(y0 + 1);

        for x in 0..size {
            let x0 = x * sw / size;
            let x1 = ((x + 1) * sw / size).max(x0 + 1);

            let (mut r, mut g, mut b, mut a) = (0.0f32, 0.0f32, 0.0f32, 0.0f32);
            let mut samples = 0.0f32;

            for sy in y0..y1 {
                for sx in x0..x1 {
                    let i = ((sy * sw + sx) * 4) as usize;
                    let pa = f32::from(src[i + 3]) / 255.0;
                    r += f32::from(src[i]) * pa;
                    g += f32::from(src[i + 1]) * pa;
                    b += f32::from(src[i + 2]) * pa;
                    a += pa;
                    samples += 1.0;
                }
            }

            let o = ((y * size + x) * 4) as usize;
            if a > 0.0 {
                out[o] = to_u8(r / a);
                out[o + 1] = to_u8(g / a);
                out[o + 2] = to_u8(b / a);
            }
            out[o + 3] = to_u8(a / samples * 255.0);
        }
    }

    out
}

/// Rasterise one state of the icon as straight (non-premultiplied) RGBA.
fn render(visual: Visual) -> Vec<u8> {
    let mut buf = vec![0u8; (SIZE * SIZE * 4) as usize];

    // The mark first, then the ring over it.
    let mark = mark();
    let offset = ((SIZE - MARK) / 2) as usize;
    for y in 0..MARK as usize {
        for x in 0..MARK as usize {
            let s = (y * MARK as usize + x) * 4;
            let d = ((y + offset) * SIZE as usize + (x + offset)) * 4;
            buf[d..d + 4].copy_from_slice(&mark[s..s + 4]);
        }
    }

    let (r, g, b) = visual.variant.rgb();
    let inner = RING_OUTER - visual.variant.stroke();
    let sweep = visual.sweep();
    // A paused run keeps its colour and its position but stops looking live.
    let arc_alpha = if visual.paused { PAUSED_ALPHA } else { 1.0 };
    let track_alpha = visual.variant.track_alpha();

    let center = SIZE as f32 / 2.0;
    let sub = 1.0 / SS as f32;
    let per_pixel = (SS * SS) as f32;

    for py in 0..SIZE {
        for px in 0..SIZE {
            let mut arc = 0.0f32;
            let mut track = 0.0f32;

            for sy in 0..SS {
                for sx in 0..SS {
                    let x = px as f32 + (sx as f32 + 0.5) * sub - center;
                    let y = py as f32 + (sy as f32 + 0.5) * sub - center;
                    let distance = (x * x + y * y).sqrt();

                    if distance < inner || distance > RING_OUTER {
                        continue;
                    }

                    if sweep > 0.0 && clock_angle(x, y) <= sweep {
                        arc += 1.0;
                    } else {
                        track += 1.0;
                    }
                }
            }

            // The two bands never cover the same subsample, so one source alpha
            // describes both.
            let alpha = (arc * arc_alpha + track * track_alpha) / per_pixel;
            let i = ((py * SIZE + px) * 4) as usize;
            over(&mut buf[i..i + 4], r, g, b, alpha);
        }
    }

    buf
}

/// Angle from twelve o'clock, clockwise, in `0..TAU`.
///
/// Screen y grows downward, so `atan2(x, -y)` puts zero at the top and turns
/// the way a clock does.
fn clock_angle(x: f32, y: f32) -> f32 {
    let angle = x.atan2(-y);
    if angle < 0.0 {
        angle + std::f32::consts::TAU
    } else {
        angle
    }
}

/// Source-over composite of a solid colour onto one straight-alpha pixel.
fn over(dst: &mut [u8], sr: u8, sg: u8, sb: u8, sa: f32) {
    if sa <= 0.0 {
        return;
    }

    let da = f32::from(dst[3]) / 255.0;
    let out_a = sa + da * (1.0 - sa);
    if out_a <= 0.0 {
        return;
    }

    for (i, src) in [sr, sg, sb].into_iter().enumerate() {
        let blended = (f32::from(src) * sa + f32::from(dst[i]) * da * (1.0 - sa)) / out_a;
        dst[i] = to_u8(blended);
    }
    dst[3] = to_u8(out_a * 255.0);
}

fn to_u8(value: f32) -> u8 {
    value.round().clamp(0.0, 255.0) as u8
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::AppState;

    fn timer(total: u32, remaining: u32) -> TimerState {
        TimerState {
            remaining_seconds: remaining,
            total_seconds: total,
            status: TimerStatus::Running,
            session_type: SessionType::Focus,
            current_session: 1,
            total_sessions: 4,
        }
    }

    #[test]
    fn step_spans_the_whole_ring() {
        assert_eq!(elapsed_step(&timer(1500, 1500)), 0);
        assert_eq!(elapsed_step(&timer(1500, 750)), STEPS / 2);
        assert_eq!(elapsed_step(&timer(1500, 0)), STEPS);
    }

    #[test]
    fn step_never_exceeds_the_ring() {
        // remaining > total should not be reachable, but a saturating elapsed
        // of zero is a better answer than an arc past the top of the circle.
        assert_eq!(elapsed_step(&timer(300, 900)), 0);
        assert_eq!(elapsed_step(&timer(0, 0)), 0);
    }

    #[test]
    fn a_second_of_a_long_session_does_not_move_the_ring() {
        // The whole point of quantising: consecutive ticks are the same icon,
        // so `apply` stops before it reaches the OS.
        assert_eq!(
            elapsed_step(&timer(3000, 2999)),
            elapsed_step(&timer(3000, 2998))
        );
    }

    #[test]
    fn variant_follows_the_session() {
        let mut state = AppState::new();
        assert_eq!(visual_for(&state).variant, Variant::Idle);

        state.timer.status = TimerStatus::Running;
        assert_eq!(visual_for(&state).variant, Variant::Focus);

        state.strict_mode.is_active = true;
        assert_eq!(visual_for(&state).variant, Variant::Strict);

        // A break is a break whether or not strict mode is on: strict governs
        // the focus run, and there is nothing to be strict about mid-break.
        state.timer.session_type = SessionType::ShortBreak;
        assert_eq!(visual_for(&state).variant, Variant::Break);

        state.timer.session_type = SessionType::LongBreak;
        assert_eq!(visual_for(&state).variant, Variant::Break);
    }

    #[test]
    fn pausing_shows_but_does_not_change_the_variant() {
        let mut state = AppState::new();
        state.timer.status = TimerStatus::Paused;

        let visual = visual_for(&state);
        assert_eq!(visual.variant, Variant::Focus);
        assert!(visual.paused);
        assert_eq!(tooltip_for(&state), "Zetta Focus Console - Paused");
    }

    #[test]
    fn every_variant_renders_a_full_opaque_buffer() {
        for variant in [
            Variant::Idle,
            Variant::Focus,
            Variant::Break,
            Variant::Strict,
        ] {
            for step in [0, STEPS / 2, STEPS] {
                let visual = Visual {
                    variant,
                    step,
                    paused: false,
                };
                let buf = render(visual);

                assert_eq!(buf.len(), (SIZE * SIZE * 4) as usize);
                assert!(
                    buf.chunks_exact(4).any(|p| p[3] > 200),
                    "{variant:?} at step {step} drew nothing solid"
                );
                // The corners sit outside the ring and outside the mark.
                assert_eq!(buf[3], 0, "{variant:?} at step {step} filled the corner");
            }
        }
    }

    #[test]
    fn the_arc_grows_clockwise_from_the_top() {
        let coverage = |step: u8| {
            render(Visual {
                variant: Variant::Focus,
                step,
                paused: false,
            })
            .chunks_exact(4)
            .map(|p| u32::from(p[3]))
            .sum::<u32>()
        };

        // More elapsed time means more of the ring at full alpha, so total
        // coverage rises monotonically.
        assert!(coverage(0) < coverage(STEPS / 2));
        assert!(coverage(STEPS / 2) < coverage(STEPS));
    }

    #[test]
    fn twelve_oclock_is_zero_and_three_oclock_is_a_quarter_turn() {
        use std::f32::consts::TAU;

        assert!(clock_angle(0.0, -1.0).abs() < 1e-5);
        assert!((clock_angle(1.0, 0.0) - TAU / 4.0).abs() < 1e-5);
        assert!((clock_angle(0.0, 1.0) - TAU / 2.0).abs() < 1e-5);
        assert!((clock_angle(-1.0, 0.0) - TAU * 3.0 / 4.0).abs() < 1e-5);
    }
}
