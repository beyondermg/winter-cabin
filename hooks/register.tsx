import type { Register, ThemeSetArgs, ThemeMessageRule } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene.js'

// Midnight-blue snow light, warmed by a fire.
const { theme, problems } = makeColors({
  label: 'Winter Cabin',
  only: 'dark',
  roles: { accent: '#f2a65a', danger: '#e86f6f', success: '#6fd3a8', warning: '#e9c46a', pro: '#a993f5' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0d1222',
        'surface-1': '#121a2e',
        'surface-2': '#172038',
        'surface-3': '#1b2540',
        'text-primary': '#eef2fb',
        'text-secondary': '#c6cee3',
        'text-muted': '#9aa5c2',
      },
    },
  },
})

const FONT_ROW = { fontSize: 15, lineHeight: 24 } as const

// Your messages: a frosted card with snow piled on top and a couple of icicles.
const SNOW_CAPPED: ThemeMessageRule = {
  color: '#f3f6fd',
  backgroundColor: '#25304f',
  paddingTop: 22,
  paddingBottom: 14,
  paddingX: 16,
  shadow: { y: 6, blur: 18, color: '#00000066' },
  fill: {
    vector: {
      viewBox: 96,
      slice: 32,
      paths: [
        { d: 'M0 24Q0 10 14 10H82Q96 10 96 24V82Q96 96 82 96H14Q0 96 0 82Z', color: '#25304f' },
        { d: 'M0 24Q0 10 14 10H82Q96 10 96 24V26Q93 21 88 23Q84 15 76 17H20Q12 15 8 23Q3 21 0 26Z', color: '#3a4670' },
        { d: 'M-1 22Q-1 3 16 2Q24 -1 32 3H64Q72 -1 80 2Q97 3 97 22Q95 17 90 19Q86 11 78 13Q72 16 64 14H32Q24 16 18 13Q10 11 6 19Q1 17 -1 22Z', color: '#eef3fe' },
        { d: 'M14 13Q16 22 18 13Z M82 13Q84 20 86 13Z', color: '#cfe0ff' },
      ],
    },
  },
}

const LOOK: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: { scene: 'winter-cabin', glass: { blur: 14, tint: '#0d1222', opacity: 0.5 } },
  style: {
    Text: FONT_ROW,
    Heading: { color: '#f6c48a', fontFamily: ['serif'], fontWeight: 'semibold' },
    UserMessage: [SNOW_CAPPED, { ...SNOW_CAPPED, rotate: -0.6 }, { ...SNOW_CAPPED, rotate: 0.5 }],
    AssistantMessage: {
      color: '#eef2fb',
      backgroundColor: '#101828ee',
      borderColor: '#f2a65a30',
      borderWidth: 1,
      radius: 16,
      padding: 16,
      shadow: { y: 4, blur: 20, color: '#ff9a3c14' },
    },
    ToolUse: {
      color: '#c6cee3',
      fontFamily: ['code'],
      backgroundColor: '#0f1628f2',
      borderColor: '#6fd3a830',
      radius: 10,
      paddingX: 10,
    },
  },
}

// Wind over the pines, a fire in the stove, the odd bell.
const SOUND: ThemeSetArgs['sound'] = {
  ambience: {
    reverb: 0.25,
    layers: [
      { wave: 'pink', drone: true, gain: 0.12, filter: { type: 'lowpass', hz: 380, to: 900 } },
      { wave: 'brown', drone: true, gain: 0.1, filter: { type: 'lowpass', hz: 160 } },
      { wave: 'crackle', scatter: 2.5, gain: 0.22, attack: 0.002, release: 0.06, filter: { type: 'bandpass', hz: 2200 } },
      { wave: 'crackle', scatter: 0.4, gain: 0.3, attack: 0.002, release: 0.18, filter: { type: 'lowpass', hz: 900 } },
    ],
  },
  cues: {
    send: { layers: [{ wave: 'bell', notes: ['E6'], gain: 0.14, release: 0.8 }], reverb: 0.4 },
    done: { layers: [{ wave: 'bell', notes: ['G5', 'B5', 'D6', 'G6'], step: 0.09, gain: 0.18, release: 1.2 }], reverb: 0.5 },
    ask: { layers: [{ wave: 'bell', notes: ['D6', 'A5'], step: 0.14, gain: 0.16, release: 0.9 }], reverb: 0.4 },
    error: { layers: [{ wave: 'triangle', notes: ['A3', 'F3'], step: 0.16, gain: 0.16, release: 0.5 }] },
    click: { layers: [{ wave: 'bell', notes: ['C6', 'D6', 'E6', 'G6', 'A6', 'C7'], gain: 0.12, release: 1 }], reverb: 0.5 },
  },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) $.ui.log(unpainted)

    let set
    try {
      set = await $.theme.set({ ...LOOK, sound: SOUND })
    } catch (error) {
      $.ui.log(`winter-cabin: full look refused, retrying plainer: ${String(error)}`)
      try {
        set = await $.theme.set(LOOK)
      } catch (error2) {
        $.ui.log(`winter-cabin: style refused: ${String(error2)}`)
        set = await $.theme.set({ colors: theme, overrideColorScheme: 'dark', backdrop: LOOK.backdrop })
      }
    }
    if (!set.isDrawn) $.ui.status(`❄ ${set.reason}`)

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'winter-cabin') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={SCENE}
        alt="A snowy night: a log cabin with glowing windows and string lights, chimney smoke, a snowman, pines, an aurora and a full moon, with snow falling"
        isInteractive
      />
    )
  })
}
