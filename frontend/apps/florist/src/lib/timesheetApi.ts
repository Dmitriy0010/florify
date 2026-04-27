import { apiClient } from './apiClient';
import type { TimesheetEntry } from './types';

export const timesheetApi = {
  checkin: async (employeeId: string) => {
    const { data } = await apiClient.post<TimesheetEntry>('/v1/timesheet/checkin', { employeeId });
    return data;
  },
  checkout: async (employeeId: string) => {
    const { data } = await apiClient.post<TimesheetEntry>('/v1/timesheet/checkout', { employeeId });
    return data;
  },
  list: async (employeeId: string, month: string) => {
    const { data } = await apiClient.get<TimesheetEntry[]>('/v1/timesheet', {
      params: { employeeId, month },
    });
    return data;
  },
};
