import { COUNTRIES, COUNTRY_BY_DIAL_CODE, COUNTRY_BY_NAME, DEFAULT_COUNTRY_NAME } from '@/constants/countries'

const sortedDialCodes = COUNTRIES
  .map(country => country.dial_code)
  .sort((a, b) => b.length - a.length)

const defaultCountry = COUNTRY_BY_NAME.get(DEFAULT_COUNTRY_NAME.toLowerCase()) ?? COUNTRIES[0]
const defaultDialCode = defaultCountry?.dial_code ?? '+1'

export const sanitizeDialCode = (value?: string) => {
  if (!value) {
    return defaultDialCode
  }
  const digits = value.replace(/[^0-9]/g, '')
  return digits ? `+${digits}` : defaultDialCode
}

export const sanitizeNationalNumber = (value?: string) => {
  if (!value) {
    return ''
  }
  return value.replace(/[^0-9]/g, '')
}

export const combineDialCodeAndNumber = (dialCode?: string, nationalNumber?: string) => {
  const normalizedDial = sanitizeDialCode(dialCode)
  const normalizedNumber = sanitizeNationalNumber(nationalNumber)
  return normalizedNumber ? `${normalizedDial}${normalizedNumber}` : normalizedDial
}

export interface PhoneSplitResult {
  dialCode: string
  nationalNumber: string
}

export const splitPhoneNumber = (value?: string): PhoneSplitResult => {
  if (!value) {
    return { dialCode: defaultDialCode, nationalNumber: '' }
  }

  const digits = value.replace(/[^0-9]/g, '')
  if (!digits) {
    return { dialCode: defaultDialCode, nationalNumber: '' }
  }

  let dialCode = defaultDialCode
  let nationalNumber = digits

  for (const code of sortedDialCodes) {
    const numericCode = code.replace('+', '')
    if (digits.startsWith(numericCode)) {
      dialCode = code
      nationalNumber = digits.slice(numericCode.length)
      break
    }
  }

  return {
    dialCode,
    nationalNumber
  }
}

export const formatInternationalPhone = (value?: string) => {
  if (!value) {
    return ''
  }
  const { dialCode, nationalNumber } = splitPhoneNumber(value)
  if (!nationalNumber) {
    return dialCode
  }

  const grouped = nationalNumber.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
  return `${dialCode} ${grouped}`.trim()
}

export const getCountryByDialCode = (dialCode?: string) => {
  if (!dialCode) {
    return defaultCountry
  }
  return COUNTRY_BY_DIAL_CODE.get(sanitizeDialCode(dialCode)) ?? defaultCountry
}

export const getCountryNames = () => COUNTRIES.map(country => country.name)
