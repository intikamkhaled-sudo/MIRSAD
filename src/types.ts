export type DataMode = 'forecast' | 'historical' | 'historical-forecast'
export interface WeatherResponse {
  latitude: number; longitude: number; timezone: string; timezone_abbreviation?: string
  elevation?: number; hourly: Record<string, (number | string | null)[]>
  hourly_units?: Record<string, string>; daily?: Record<string, (number | string | null)[]>
}
export interface WeatherVariable {
  key: string; label: string; unit: string; color: string
}
