export const colorOptions = [
  'slate','gray','zinc','neutral','stone',
  'red','orange','amber','yellow','lime','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','fuchsia','pink','rose'
] as const
export type ColorName = typeof colorOptions[number]

// ボタンやピッカーなどに使う少し柔らかめのグラデーション
export function gradientFor(color: ColorName) {
  return `bg-gradient-to-br from-${color}-400 to-${color}-600`
}

// カードのアクセント（ドット/バー）用の淡いグラデーション
export function accentFor(color: ColorName) {
  return `bg-gradient-to-br from-${color}-300 to-${color}-500`
}

// CTA向け（ややコントラスト高め）
export function buttonGradientFor(color: ColorName) {
  return `bg-gradient-to-br from-${color}-500 to-${color}-600`
}
