export type ID = number;
export type ISODate = string;

export interface User {
  id: ID;
  name: string;
  email: string;
  email_verified_at: ISODate | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export type DeviceStatus = 'online' | 'offline' | 'maintenance' | string;

export interface Device {
  id: ID;
  user_id: ID;
  serial_code: string;
  name: string | null;
  location_lat: string | number | null;
  location_lng: string | number | null;
  status: DeviceStatus;
  paired_at: ISODate | null;
  created_at: ISODate;
  updated_at: ISODate;
  latest_telemetry?: TelemetryReading | null;
  feeding_schedules?: FeedingSchedule[];
}

export interface TelemetryReading {
  id: ID;
  device_id: ID;
  reservoir_level_cm: string | number | null;
  reservoir_level_percentage: string | number | null;
  temperature: string | number | null;
  humidity: string | number | null;
  battery_voltage: string | number | null;
  read_at: ISODate;
  created_at: ISODate;
}

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface FeedingSchedule {
  id: ID;
  device_id: ID;
  scheduled_time: string;
  portion_grams: number;
  days_of_week: DayOfWeek[] | null;
  is_active: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

export type FeedingTriggerType = 'manual' | 'scheduled' | 'remote' | string;
export type FeedingEventStatus = 'pending' | 'success' | 'failure' | string;

export interface FeedingEvent {
  id: ID;
  device_id: ID;
  schedule_id: ID | null;
  trigger_type: FeedingTriggerType;
  portion_grams: number;
  status: FeedingEventStatus;
  executed_at: ISODate | null;
  created_at: ISODate;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical' | string;

export interface Alert {
  id: ID;
  device_id: ID;
  type: string;
  message: string;
  severity: AlertSeverity;
  is_read: boolean;
  resolved_at: ISODate | null;
  created_at: ISODate;
  updated_at: ISODate;
  device?: Device;
}

export interface Paginated<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface MessageResponse {
  message: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PairDevicePayload {
  serial_code: string;
  name?: string;
}

export interface UpdateDevicePayload {
  name?: string;
  location_lat?: number;
  location_lng?: number;
}

export interface StoreSchedulePayload {
  scheduled_time: string;
  portion_grams: number;
  days_of_week?: DayOfWeek[];
  is_active?: boolean;
}

export interface ManualFeedPayload {
  portion_grams?: number;
}

export interface TelemetryIngestPayload {
  reservoir_level_cm?: number;
  temperature?: number;
  humidity?: number;
  battery_voltage?: number;
  read_at?: ISODate;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}
